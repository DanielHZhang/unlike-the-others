/**
 * https://github.com/byronknoll/visibility-polygon-js version 1.9 by Byron Knoll.
 *
 * This library can be used to construct a visibility polygon for a set of line segments.
 * The time complexity of this implementation is O(N log N) (where N is the total number of line segments).
 */
export class RaycastPolygon {
  /**
   * Computes a visibility polygon. O(N log N) time complexity (where N is the number of line segments).
   * @param position The location of the observer. If the observer is not completely surrounded by line segments, an outer bounding-box will be automatically created (so that the visibility polygon does not extend to infinity).
   * @param segments A list of line segments. Each line segment should be a list of two points. Each point should be a list of two coordinates. Line segments can not intersect each other. Overlapping vertices are OK, but it is not OK if a vertex is touching the middle of a line segment. Use the "breakIntersections" function to fix intersecting line segments.
   * @returns The visibility polygon (in clockwise vertex order).
   */
  compute(position: number[], segments: number[][][]) {
    const bounded: number[][][] = [];
    let minX = position[0];
    let minY = position[1];
    let maxX = position[0];
    let maxY = position[1];
    for (let i = 0; i < segments.length; ++i) {
      for (let j = 0; j < 2; ++j) {
        minX = Math.min(minX, segments[i][j][0]);
        minY = Math.min(minY, segments[i][j][1]);
        maxX = Math.max(maxX, segments[i][j][0]);
        maxY = Math.max(maxY, segments[i][j][1]);
      }
      bounded.push([
        [segments[i][0][0], segments[i][0][1]],
        [segments[i][1][0], segments[i][1][1]],
      ]);
    }
    --minX;
    --minY;
    ++maxX;
    ++maxY;
    bounded.push([
      [minX, minY],
      [maxX, minY],
    ]);
    bounded.push([
      [maxX, minY],
      [maxX, maxY],
    ]);
    bounded.push([
      [maxX, maxY],
      [minX, maxY],
    ]);
    bounded.push([
      [minX, maxY],
      [minX, minY],
    ]);
    const polygon = [];
    const sorted = this.sortPoints(position, bounded);
    const map: number[] = new Array(bounded.length);
    for (let i = 0; i < map.length; ++i) {
      map[i] = -1;
    }
    const heap: number[] = [];
    const start = [position[0] + 1, position[1]];
    for (let i = 0; i < bounded.length; ++i) {
      const a1 = this.angle(bounded[i][0], position);
      const a2 = this.angle(bounded[i][1], position);
      let active = false;
      if (a1 > -180 && a1 <= 0 && a2 <= 180 && a2 >= 0 && a2 - a1 > 180) {
        active = true;
      }
      if (a2 > -180 && a2 <= 0 && a1 <= 180 && a1 >= 0 && a1 - a2 > 180) {
        active = true;
      }
      if (active) {
        this.insert(i, heap, position, bounded, start, map);
      }
    }
    for (let i = 0; i < sorted.length; ) {
      let extend = false;
      let shorten = false;
      const orig = i;
      let vertex = bounded[sorted[i][0]][sorted[i][1]];
      const oldSegment = heap[0];
      do {
        if (map[sorted[i][0]] !== -1) {
          if (sorted[i][0] === oldSegment) {
            extend = true;
            vertex = bounded[sorted[i][0]][sorted[i][1]];
          }
          this.remove(map[sorted[i][0]], heap, position, bounded, vertex, map);
        } else {
          this.insert(sorted[i][0], heap, position, bounded, vertex, map);
          if (heap[0] !== oldSegment) {
            shorten = true;
          }
        }
        ++i;
        if (i === sorted.length) {
          break;
        }
      } while (sorted[i][2] < sorted[orig][2] + this.epsilon());

      if (extend) {
        polygon.push(vertex);
        const cur = this.intersectLines(bounded[heap[0]][0], bounded[heap[0]][1], position, vertex);
        if (!this.equal(cur, vertex)) {
          polygon.push(cur);
        }
      } else if (shorten) {
        polygon.push(
          this.intersectLines(bounded[oldSegment][0], bounded[oldSegment][1], position, vertex)
        );
        polygon.push(
          this.intersectLines(bounded[heap[0]][0], bounded[heap[0]][1], position, vertex)
        );
      }
    }
    return polygon;
  }

  /**
   * Computes a visibility polygon within the given viewport.
   * This can be faster than the "compute" function if there are many segments outside of the viewport.
   * @param position The location of the observer. Must be within the viewport.
   * @param segments A list of line segments. Line segments can not intersect each other. It is OK if line segments intersect the viewport.
   * @param viewportMinCorner The minimum X and Y coordinates of the viewport.
   * @param viewportMaxCorner The maximum X and Y coordinates of the viewport.
   * @returns The visibility polygon within the viewport (in clockwise vertex order).
   */
  computeViewport(
    position: number[],
    segments: number[][][],
    viewportMinCorner: [number, number],
    viewportMaxCorner: [number, number]
  ) {
    const brokenSegments: number[][][] = [];
    const viewport = [
      [viewportMinCorner[0], viewportMinCorner[1]],
      [viewportMaxCorner[0], viewportMinCorner[1]],
      [viewportMaxCorner[0], viewportMaxCorner[1]],
      [viewportMinCorner[0], viewportMaxCorner[1]],
    ];
    for (let i = 0; i < segments.length; ++i) {
      if (segments[i][0][0] < viewportMinCorner[0] && segments[i][1][0] < viewportMinCorner[0]) {
        continue;
      }
      if (segments[i][0][1] < viewportMinCorner[1] && segments[i][1][1] < viewportMinCorner[1]) {
        continue;
      }
      if (segments[i][0][0] > viewportMaxCorner[0] && segments[i][1][0] > viewportMaxCorner[0]) {
        continue;
      }
      if (segments[i][0][1] > viewportMaxCorner[1] && segments[i][1][1] > viewportMaxCorner[1]) {
        continue;
      }
      const intersections: number[][] = [];
      for (let j = 0; j < viewport.length; ++j) {
        let k = j + 1;
        if (k === viewport.length) {
          k = 0;
        }
        if (
          this.doLineSegmentsIntersect(
            segments[i][0][0],
            segments[i][0][1],
            segments[i][1][0],
            segments[i][1][1],
            viewport[j][0],
            viewport[j][1],
            viewport[k][0],
            viewport[k][1]
          )
        ) {
          const intersect = this.intersectLines(
            segments[i][0],
            segments[i][1],
            viewport[j],
            viewport[k]
          );
          if (intersect.length !== 2) {
            continue;
          }
          if (this.equal(intersect, segments[i][0]) || this.equal(intersect, segments[i][1])) {
            continue;
          }
          intersections.push(intersect);
        }
      }
      const start = [segments[i][0][0], segments[i][0][1]];
      while (intersections.length > 0) {
        let endIndex = 0;
        let endDis = this.distance(start, intersections[0]);
        for (let j = 1; j < intersections.length; ++j) {
          const dis = this.distance(start, intersections[j]);
          if (dis < endDis) {
            endDis = dis;
            endIndex = j;
          }
        }
        brokenSegments.push([
          [start[0], start[1]],
          [intersections[endIndex][0], intersections[endIndex][1]],
        ]);
        start[0] = intersections[endIndex][0];
        start[1] = intersections[endIndex][1];
        intersections.splice(endIndex, 1);
      }
      brokenSegments.push([start, [segments[i][1][0], segments[i][1][1]]]);
    }

    const viewportSegments: number[][][] = [];
    for (let i = 0; i < brokenSegments.length; ++i) {
      if (
        this.inViewport(brokenSegments[i][0], viewportMinCorner, viewportMaxCorner) &&
        this.inViewport(brokenSegments[i][1], viewportMinCorner, viewportMaxCorner)
      ) {
        viewportSegments.push([
          [brokenSegments[i][0][0], brokenSegments[i][0][1]],
          [brokenSegments[i][1][0], brokenSegments[i][1][1]],
        ]);
      }
    }
    const eps = this.epsilon() * 10;
    viewportSegments.push([
      [viewportMinCorner[0] - eps, viewportMinCorner[1] - eps],
      [viewportMaxCorner[0] + eps, viewportMinCorner[1] - eps],
    ]);
    viewportSegments.push([
      [viewportMaxCorner[0] + eps, viewportMinCorner[1] - eps],
      [viewportMaxCorner[0] + eps, viewportMaxCorner[1] + eps],
    ]);
    viewportSegments.push([
      [viewportMaxCorner[0] + eps, viewportMaxCorner[1] + eps],
      [viewportMinCorner[0] - eps, viewportMaxCorner[1] + eps],
    ]);
    viewportSegments.push([
      [viewportMinCorner[0] - eps, viewportMaxCorner[1] + eps],
      [viewportMinCorner[0] - eps, viewportMinCorner[1] - eps],
    ]);
    return this.compute(position, viewportSegments);
  }

  inViewport(position: number[], viewportMinCorner: number[], viewportMaxCorner: number[]) {
    if (position[0] < viewportMinCorner[0] - this.epsilon()) {
      return false;
    }
    if (position[1] < viewportMinCorner[1] - this.epsilon()) {
      return false;
    }
    if (position[0] > viewportMaxCorner[0] + this.epsilon()) {
      return false;
    }
    if (position[1] > viewportMaxCorner[1] + this.epsilon()) {
      return false;
    }
    return true;
  }

  /**
   * Calculates whether a point is within a polygon.
   * O(N) time complexity (where N is the number of points in the polygon).
   * @param position The point to check: a list of two coordinates.
   * @param polygon The polygon to check: a list of points. The polygon can be specified in either clockwise or counterclockwise vertex order.
   * @returns True if "position" is within the polygon.
   */
  inPolygon(position: number[], polygon: number[][]) {
    let val = polygon[0][0];
    for (let i = 0; i < polygon.length; ++i) {
      val = Math.min(polygon[i][0], val);
      val = Math.min(polygon[i][1], val);
    }
    const edge = [val - 1, val - 1];
    let parity = 0;
    for (let i = 0; i < polygon.length; ++i) {
      let j = i + 1;
      if (j === polygon.length) {
        j = 0;
      }
      if (
        this.doLineSegmentsIntersect(
          edge[0],
          edge[1],
          position[0],
          position[1],
          polygon[i][0],
          polygon[i][1],
          polygon[j][0],
          polygon[j][1]
        )
      ) {
        const intersect = this.intersectLines(edge, position, polygon[i], polygon[j]);
        if (this.equal(position, intersect)) {
          return true;
        }
        if (this.equal(intersect, polygon[i])) {
          if (this.angle2(position, edge, polygon[j]) < 180) {
            ++parity;
          }
        } else if (this.equal(intersect, polygon[j])) {
          if (this.angle2(position, edge, polygon[i]) < 180) {
            ++parity;
          }
        } else {
          ++parity;
        }
      }
    }
    return parity % 2 !== 0;
  }

  /**
   * Converts the given polygons to list of line segments. O(N) time complexity (where N is the number of polygons).
   * @param polygons A list of polygons (in either clockwise or counterclockwise vertex order). Each polygon should be a list of points. Each point should be a list of two coordinates.
   * @returns a list of line segments.
   */
  convertToSegments(polygons: number[][][]) {
    const segments = [];
    for (let i = 0; i < polygons.length; ++i) {
      for (let j = 0; j < polygons[i].length; ++j) {
        let k = j + 1;
        if (k === polygons[i].length) {
          k = 0;
        }
        segments.push([
          [polygons[i][j][0], polygons[i][j][1]],
          [polygons[i][k][0], polygons[i][k][1]],
        ]);
      }
    }
    return segments;
  }

  /**
   * 5) this.breakIntersections(segments)
  Breaks apart line segments so that none of them intersect. O(N^2) time complexity (where N is the number of line segments).
  Arguments: a list of line segments. Each line segment should be a list of two points. Each point should be a list of two coordinates.
  Returns: a list of line segments.
   * @param segments
   */
  breakIntersections(segments: number[][][]) {
    const output = [];
    for (let i = 0; i < segments.length; ++i) {
      const intersections = [];
      for (let j = 0; j < segments.length; ++j) {
        if (i === j) {
          continue;
        }
        if (
          this.doLineSegmentsIntersect(
            segments[i][0][0],
            segments[i][0][1],
            segments[i][1][0],
            segments[i][1][1],
            segments[j][0][0],
            segments[j][0][1],
            segments[j][1][0],
            segments[j][1][1]
          )
        ) {
          const intersect = this.intersectLines(
            segments[i][0],
            segments[i][1],
            segments[j][0],
            segments[j][1]
          );
          if (intersect.length !== 2) {
            continue;
          }
          if (this.equal(intersect, segments[i][0]) || this.equal(intersect, segments[i][1])) {
            continue;
          }
          intersections.push(intersect);
        }
      }
      const start = [segments[i][0][0], segments[i][0][1]];
      while (intersections.length > 0) {
        let endIndex = 0;
        let endDis = this.distance(start, intersections[0]);
        for (let j = 1; j < intersections.length; ++j) {
          const dis = this.distance(start, intersections[j]);
          if (dis < endDis) {
            endDis = dis;
            endIndex = j;
          }
        }
        output.push([
          [start[0], start[1]],
          [intersections[endIndex][0], intersections[endIndex][1]],
        ]);
        start[0] = intersections[endIndex][0];
        start[1] = intersections[endIndex][1];
        intersections.splice(endIndex, 1);
      }
      output.push([start, [segments[i][1][0], segments[i][1][1]]]);
    }
    return output;
  }

  epsilon() {
    return 0.0000001;
  }

  equal(a: number[], b: number[]) {
    if (Math.abs(a[0] - b[0]) < this.epsilon() && Math.abs(a[1] - b[1]) < this.epsilon()) {
      return true;
    }
    return false;
  }

  remove(
    index: number,
    heap: number[],
    position: number[],
    segments: number[][][],
    destination: number[],
    map: number[]
  ) {
    map[heap[index]] = -1;
    if (index === heap.length - 1) {
      heap.pop();
      return;
    }
    heap[index] = heap.pop()!;
    map[heap[index]] = index;
    let cur = index;
    let parent = this.parent(cur);
    if (cur !== 0 && this.lessThan(heap[cur], heap[parent], position, segments, destination)) {
      while (cur > 0) {
        // ORIGINAL WAS VAR =
        parent = this.parent(cur);
        if (!this.lessThan(heap[cur], heap[parent], position, segments, destination)) {
          break;
        }
        map[heap[parent]] = cur;
        map[heap[cur]] = parent;
        const temp = heap[cur];
        heap[cur] = heap[parent];
        heap[parent] = temp;
        cur = parent;
      }
    } else {
      while (true) {
        const left = this.child(cur);
        const right = left + 1;
        if (
          left < heap.length &&
          this.lessThan(heap[left], heap[cur], position, segments, destination) &&
          (right === heap.length ||
            this.lessThan(heap[left], heap[right], position, segments, destination))
        ) {
          map[heap[left]] = cur;
          map[heap[cur]] = left;
          const temp = heap[left];
          heap[left] = heap[cur];
          heap[cur] = temp;
          cur = left;
        } else if (
          right < heap.length &&
          this.lessThan(heap[right], heap[cur], position, segments, destination)
        ) {
          map[heap[right]] = cur;
          map[heap[cur]] = right;
          const temp = heap[right];
          heap[right] = heap[cur];
          heap[cur] = temp;
          cur = right;
        } else {
          break;
        }
      }
    }
  }

  insert(
    index: number,
    heap: number[],
    position: number[],
    segments: number[][][],
    destination: number[],
    map: number[]
  ) {
    const intersect = this.intersectLines(
      segments[index][0],
      segments[index][1],
      position,
      destination
    );
    if (intersect.length === 0) {
      return;
    }
    let cur = heap.length;
    heap.push(index);
    map[index] = cur;
    while (cur > 0) {
      const parent = this.parent(cur);
      if (!this.lessThan(heap[cur], heap[parent], position, segments, destination)) {
        break;
      }
      map[heap[parent]] = cur;
      map[heap[cur]] = parent;
      const temp = heap[cur];
      heap[cur] = heap[parent];
      heap[parent] = temp;
      cur = parent;
    }
  }

  lessThan(
    index1: number,
    index2: number,
    position: number[],
    segments: number[][][],
    destination: number[]
  ) {
    const inter1 = this.intersectLines(
      segments[index1][0],
      segments[index1][1],
      position,
      destination
    );
    const inter2 = this.intersectLines(
      segments[index2][0],
      segments[index2][1],
      position,
      destination
    );
    if (!this.equal(inter1, inter2)) {
      const d1 = this.distance(inter1, position);
      const d2 = this.distance(inter2, position);
      return d1 < d2;
    }
    let end1 = 0;
    if (this.equal(inter1, segments[index1][0])) {
      end1 = 1;
    }
    let end2 = 0;
    if (this.equal(inter2, segments[index2][0])) {
      end2 = 1;
    }
    const a1 = this.angle2(segments[index1][end1], inter1, position);
    const a2 = this.angle2(segments[index2][end2], inter2, position);
    if (a1 < 180) {
      if (a2 > 180) {
        return true;
      }
      return a2 < a1;
    }
    return a1 < a2;
  }

  parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  child(index: number) {
    return 2 * index + 1;
  }

  angle2(a: number[], b: number[], c: number[]) {
    const a1 = this.angle(a, b);
    const a2 = this.angle(b, c);
    let a3 = a1 - a2;
    if (a3 < 0) {
      a3 += 360;
    }
    if (a3 > 360) {
      a3 -= 360;
    }
    return a3;
  }

  sortPoints(position: number[], segments: number[][][]) {
    const points: number[][] = new Array(segments.length * 2);
    for (let i = 0; i < segments.length; ++i) {
      for (let j = 0; j < 2; ++j) {
        const a = this.angle(segments[i][j], position);
        points[2 * i + j] = [i, j, a];
      }
    }
    points.sort((a, b) => a[2] - b[2]);
    return points;
  }

  angle(a: number[], b: number[]) {
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  }

  intersectLines(a1: number[], a2: number[], b1: number[], b2: number[]) {
    const dbx = b2[0] - b1[0];
    const dby = b2[1] - b1[1];
    const dax = a2[0] - a1[0];
    const day = a2[1] - a1[1];
    const u_b = dby * dax - dbx * day;
    if (u_b !== 0) {
      const ua = (dbx * (a1[1] - b1[1]) - dby * (a1[0] - b1[0])) / u_b;
      return [a1[0] - ua * -dax, a1[1] - ua * -day];
    }
    return [];
  }

  distance(a: number[], b: number[]) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  isOnSegment(xi: number, yi: number, xj: number, yj: number, xk: number, yk: number) {
    return (
      (xi <= xk || xj <= xk) &&
      (xk <= xi || xk <= xj) &&
      (yi <= yk || yj <= yk) &&
      (yk <= yi || yk <= yj)
    );
  }

  computeDirection(xi: number, yi: number, xj: number, yj: number, xk: number, yk: number) {
    const a = (xk - xi) * (yj - yi);
    const b = (xj - xi) * (yk - yi);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  doLineSegmentsIntersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ) {
    const d1 = this.computeDirection(x3, y3, x4, y4, x1, y1);
    const d2 = this.computeDirection(x3, y3, x4, y4, x2, y2);
    const d3 = this.computeDirection(x1, y1, x2, y2, x3, y3);
    const d4 = this.computeDirection(x1, y1, x2, y2, x4, y4);
    return (
      (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
      (d1 === 0 && this.isOnSegment(x3, y3, x4, y4, x1, y1)) ||
      (d2 === 0 && this.isOnSegment(x3, y3, x4, y4, x2, y2)) ||
      (d3 === 0 && this.isOnSegment(x1, y1, x2, y2, x3, y3)) ||
      (d4 === 0 && this.isOnSegment(x1, y1, x2, y2, x4, y4))
    );
  }
}

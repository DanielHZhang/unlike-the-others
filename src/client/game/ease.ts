export const Ease = new (class {
  public in = (t: number, p = 1): number => t ** p;

  public out = (t: number, p = 1): number => 1 - this.in(1 - t, p);

  public inOut = (t: number, p = 1): number => {
    if (t <= 0.5) {
      return Ease.in(t * 2, p) / 2;
    }
    return 1 - Ease.inOut(1 - t, p);
  };
})();

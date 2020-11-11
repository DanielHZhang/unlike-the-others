import {Movement} from 'src/shared/constants';
import type {Keybindings} from 'src/shared/types';

export class KeyboardManager {
  private keyCodeToAction: Map<string, keyof Keybindings> = new Map();
  private actionToState: Map<keyof Keybindings, boolean> = new Map();

  public constructor(bindings: Keybindings) {
    this.setBindings(bindings);
  }

  /**
   * Set new keybindings.
   * @param bindings The keybindings object to be set.
   */
  public setBindings(bindings: Keybindings): void {
    this.keyCodeToAction.clear();
    this.actionToState.clear();
    const entries = Object.entries(bindings).map(([action, keyCode]) => [keyCode, action]);
    this.keyCodeToAction = new Map(entries as [string, keyof Keybindings][]);
  }

  // public isKeyDown(key: keyof Keybindings): boolean {
  //   return !!this.actionToState.get(key);
  // }

  /**
   * Sets all keyboard action states to false.
   */
  public reset(): void {
    this.actionToState.clear();
  }

  /**
   * Check if any of the keys controlling movement are down. Ensure that only one
   * direction per axis can be moved at the same time.
   */
  public isMovementKeyDown(axis: 'horizontal' | 'vertical'): Movement {
    // Check vertical
    if (axis === 'vertical') {
      if (this.actionToState.get('up')) {
        if (this.actionToState.get('down')) {
          return Movement.None;
        }
        return Movement.Up;
      }
      if (this.actionToState.get('down')) {
        if (this.actionToState.get('up')) {
          return Movement.None;
        }
        return Movement.Down;
      }
    }
    // Check horizontal
    if (this.actionToState.get('left')) {
      if (this.actionToState.get('right')) {
        return Movement.None;
      }
      return Movement.Left;
    }
    if (this.actionToState.get('right')) {
      if (this.actionToState.get('left')) {
        return Movement.None;
      }
      return Movement.Right;
    }
    return Movement.None;
  }

  public processKeyDown(code: string, key: string): void {
    const action = this.keyCodeToAction.get(code);
    if (!action) {
      return;
    }
    const state = this.actionToState.get(action);
    if (!state) {
      this.actionToState.set(action, true);
    }
  }

  public processKeyUp(code: string, key: string): void {
    const action = this.keyCodeToAction.get(code);
    if (!action) {
      return;
    }
    const state = this.actionToState.get(action);
    if (state) {
      this.actionToState.set(action, false);
    }
  }
}

import {Keybindings} from 'src/shared/types';

export class KeyboardManager {
  private keyCodeToAction: Map<string, keyof Keybindings> = new Map();
  private actionToState: Map<keyof Keybindings, boolean> = new Map();

  public constructor(bindings: Keybindings) {
    this.setBindings(bindings);
  }

  public setBindings(bindings: Keybindings): void {
    this.keyCodeToAction.clear();
    this.actionToState.clear();
    const entries = Object.entries(bindings).map(([action, keyCode]) => [keyCode, action]);
    this.keyCodeToAction = new Map(entries as [string, keyof Keybindings][]);
  }

  // public isKeyDown(key: keyof Keybindings): boolean {
  //   return !!this.actionToState.get(key);
  // }

  public processKeyDown(code: string, key: string): void {
    const action = this.keyCodeToAction.get(code);
    if (!action) {
      return;
    }
    const state = this.actionToState.get(action);
    if (!state) {
      return;
    }
    if (!state) {
      this.actionToState.set(action, false);
    }
  }

  public processKeyUp(code: string, key: string): void {
    const action = this.keyCodeToAction.get(code);
    if (!action) {
      return;
    }
    const state = this.actionToState.get(action);
    if (!state) {
      return;
    }
    if (state) {
      this.actionToState.set(action, true);
    }
  }
}

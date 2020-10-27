import {RecoilState} from 'recoil';
import {useAtomLoadable} from 'src/client/hooks/use-atom-loadable';
import {AsyncSetter} from 'src/shared/types';

export function useAtomAsync<T>(atom: RecoilState<T>): [T, (arg: AsyncSetter<T>) => void] {
  const [value, setValue] = useAtomLoadable(atom);
  if (value.state === 'hasValue') {
    return [value.contents, setValue];
  }
  return value;
  throw value.contents;
}

export function useSetAtomAsync<T>(atom: RecoilState<T>): (arg: AsyncSetter<T>) => void {
  const [, setValue] = useAtomLoadable(atom);
  return setValue;
}

export function useAtomAsyncValue<T>(atom: RecoilState<T>): T {
  const [value] = useAtomLoadable(atom);
  if (value.state === 'hasValue') {
    return value.contents;
  }
  return value;
  // throw value.contents;
}

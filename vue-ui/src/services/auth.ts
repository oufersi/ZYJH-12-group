export let token = '';
export let srand = '';

export function setToken(v: string) {
  if (v) {
    token = v;
  }
}

export function setSrand(v: string) {
  if (v) {
    srand = v;
  }
}
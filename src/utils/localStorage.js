export const getItemInLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key) || 'null');
};

export const removeItemInLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const setItemInLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
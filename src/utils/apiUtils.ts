export function unwrapODataResponse<T>(response: any): T[] {
  if (!response || typeof response !== 'object') {
    return [];
  }

  const recursiveUnwrap = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(recursiveUnwrap);
    }

    if ('results' in obj && Array.isArray(obj.results)) {
      return recursiveUnwrap(obj.results);
    }

    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        
        if (key === '__metadata') {
          continue;
        }

        newObj[key] = recursiveUnwrap(obj[key]);
      }
    }
    return newObj;
  };

  let data: any;
  if (response.d) {
    const unwrappedD = recursiveUnwrap(response.d);
    data = Array.isArray(unwrappedD) ? unwrappedD : [unwrappedD];
  } else if (response.results) {
    data = recursiveUnwrap(response.results);
  } else {
    data = Array.isArray(recursiveUnwrap(response)) ? recursiveUnwrap(response) : [recursiveUnwrap(response)];
  }

  return data as T[];
}
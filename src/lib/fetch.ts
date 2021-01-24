const fetchPost = async (
  path: string,
  body: string,
  headers: {},
  contentType: string,
) => {
  return fetch(path, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': contentType,
      ...headers,
    },
    body: body,
  })
}

export const fetchPostJson = async (path: string, body: any) => {
  return fetchPost(
    path,
    JSON.stringify(body),
    {},
    'application/json',
  ).then((response) => response.json())
}

export const fetchPostForm = async (path: string, body: any, headers = {}) => {
  return fetchPost(
    path,
    body,
    headers,
    'application/x-www-form-urlencoded; charset=UTF-8',
  )
}


export function populateAccounts (stormpath, collection, attribute) {
  return Promise.all(collection.map(resource => populateAccount(stormpath, resource, attribute)))
}

export function populateAccount (stormpath, resource, attribute) {
  if (!resource[attribute] || resource[attribute].length < 1) {
    return Promise.resolve(resource)
  }

  return new Promise((resolve, reject) => {
    stormpath.getAccount(resource[attribute], { expand: 'customData' }, (err, account) => {
      if (err) {
        reject(err)
      } else {
        resource[`_${attribute}`] = account // Set it on a similar value, but don't override the id
        resolve(resource)
      }
    })
  })
}

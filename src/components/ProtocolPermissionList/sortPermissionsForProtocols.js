/**
 * Sorts and groups an array of permissions by protocol and security level.
 *
 * This function takes an array of permission objects and organizes them into a nested structure
 * based on the unique combination of protocol and security level. It groups permissions by
 * creating a composite key from these two attributes, ensuring that each combination of protocol
 * and security level is represented uniquely, even if the protocol names contain spaces or other
 * special characters. The function then maps these groups back to a more readable format,
 * separating out the protocol names for easy readability and use.
 *
 * This approach allows a more flexible and reliable grouping of permissions by protocol,
 * accommodating cases where protocol names may contain a wide variety of characters.
 *
 * @param {Array} permissions - An array of permission objects to be sorted and grouped.
 *                              Each object should have 'protocol', 'securityLevel',
 *                              'counterparty', and other relevant properties.
 *
 * @returns {Array} An array of objects, each representing a unique combination of
 *                  protocol and security level, along with their associated permissions.
 */
const sortPermissionsForProtocols = (permissions) => {
  const groupedPermissions = permissions.reduce((acc, curr) => {
    // Create a composite key object
    const protocolIdentifierObj = { protocol: curr.protocol, securityLevel: curr.securityLevel }
    // Convert the object to a JSON string for use as a key
    const protocolIdentifierKey = JSON.stringify(protocolIdentifierObj)

    // Check if the domain already exists in the accumulator
    if (!acc[protocolIdentifierKey]) {
      // If not, initialize it with the current counterparty and permission grant
      acc[protocolIdentifierKey] = [{ counterparty: curr.counterparty, permissionGrant: curr }]
    } else {
      // If it exists, add the counterparty and permission grant if it's not already there
      const existingEntry = acc[protocolIdentifierKey].find(entry => entry.counterparty === curr.counterparty)
      if (!existingEntry) {
        acc[protocolIdentifierKey].push({ counterparty: curr.counterparty, permissionGrant: curr })
      }
    }
    return acc
  }, {})

  // Convert the grouped permissions object to the desired array format
  return Object.entries(groupedPermissions).map(([protocolIdentifierKey, permissions]) => {
    // Parse the JSON string back to an object to extract the protocol name
    const { protocol } = JSON.parse(protocolIdentifierKey)
    return {
      protocol,
      permissions
    }
  })
}
export default sortPermissionsForProtocols

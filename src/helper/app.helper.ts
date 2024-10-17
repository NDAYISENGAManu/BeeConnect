export const checkHasPolicy = (
    policy: string[], 
    role: number[], 
    orgType: number[]
  ): boolean => {
    const policiesString = localStorage.getItem('policies');
    const storedPolicies = policiesString ? JSON.parse(policiesString) : [];
  
    const userRoleTypeString = localStorage.getItem('role');
    const userOrgTypeString = localStorage.getItem('organizationType');

    const userRoleType = userRoleTypeString ? parseInt(userRoleTypeString, 10) : null;
    const userOrgType = userOrgTypeString ? parseInt(userOrgTypeString, 10) : null;
  
    const hasAllPolicies = policy.length > 0 && policy.every(p => storedPolicies.includes(p));
  
    const hasOneInRoles = role.length > 0 && userRoleType !== null && role.includes(userRoleType);
    const hasOrganization = orgType.length && userOrgType !==null && orgType.includes(userOrgType);
    if (policy.length ==0  && hasOneInRoles && hasOrganization) {
      return true
    }
  
    if (hasAllPolicies && hasOneInRoles && hasOrganization) {
      return true;
    }
    return false;
  };

  export const base64ToBlob = (base64: string, contentType: string) => {
    const sliceSize = 512;
    const byteCharacters = atob(base64);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  };
  
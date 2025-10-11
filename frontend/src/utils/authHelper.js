// Utilidad para manejar la autenticación y roles de usuario
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      email: payload.email
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

export const hasRole = (requiredRoles) => {
  const user = getCurrentUser();
  console.log('🔐 hasRole - Verificando rol:', {
    user,
    requiredRoles,
    userRole: user?.role
  });
  
  if (!user) {
    console.log('❌ hasRole - No hay usuario autenticado');
    return false;
  }
  
  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }
  
  const hasPermission = requiredRoles.includes(user.role);
  console.log('🔐 hasRole - Resultado:', {
    hasPermission,
    userRole: user.role,
    requiredRoles,
    includes: requiredRoles.includes(user.role)
  });
  
  return hasPermission;
};

export const canCreateClient = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canEditClient = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canDeleteClient = () => {
  const result = hasRole(['admin']);
  console.log('🔐 canDeleteClient - Verificando permisos:', {
    result,
    currentUser: getCurrentUser(),
    requiredRoles: ['admin']
  });
  return result;
};

export const canViewClientHistory = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canCreateProject = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const logUserInfo = () => {
  const user = getCurrentUser();
  if (user) {
    console.log('👤 Usuario actual:', {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    });
    console.log('🔐 Permisos:', {
      canCreateClient: canCreateClient(),
      canEditClient: canEditClient(),
      canDeleteClient: canDeleteClient()
    });
  } else {
    console.log('❌ No hay usuario autenticado');
  }
};

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
  
  if (!user) {
    return false;
  }
  
  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }
  
  const hasPermission = requiredRoles.includes(user.role);
  
  return hasPermission;
};

export const canCreateClient = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canEditClient = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canDeleteClient = () => {
  return hasRole(['admin']);
};

export const canViewClientHistory = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canCreateProject = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canEditProject = () => {
  return hasRole(['admin', 'jefa_comercial', 'vendedor_comercial']);
};

export const canDeleteProject = () => {
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
      canDeleteClient: canDeleteClient(),
      canCreateProject: canCreateProject(),
      canEditProject: canEditProject(),
      canDeleteProject: canDeleteProject()
    });
  } else {
    console.log('❌ No hay usuario autenticado');
  }
};

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import ModuloBase from '../components/ModuloBase';
import { createQuote, getQuote, updateQuote } from '../services/quotes';
import { getExistingServices, listProjects, createProject, searchProjectsByName } from '../services/projects';
import { getOrCreateCompany, listCompanies } from '../services/companies';
import CompanyProjectPicker from '../components/CompanyProjectPicker';
import SubserviceAutocompleteFinal from '../components/SubserviceAutocompleteFinal';
import SuccessModal from '../components/SuccessModal';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import './CotizacionInteligente.css';
import '../styles/autocomplete.css';

const emptyClient = {
  company_name: '', ruc: '', contact_name: '', contact_phone: '', contact_email: '',
  project_location: '', project_name: '',
};

const emptyQuote = {
  request_date: '', issue_date: '', commercial_name: '', commercial_phone: '', 
  payment_terms: 'adelantado', reference: '', reference_type: ['email', 'phone'], 
  igv: true, delivery_days: 4, category_main: 'laboratorio',
};

const emptyItem = { code: '', description: '', norm: '', unit_price: 0, quantity: 1 };

function computePartial(item) {
  const u = Number(item.unit_price || 0);
  const q = Number(item.quantity || 0);
  return Number((u * q).toFixed(2));
}

function suggestedFileName(seq = 'xxx-XX', client = '') {
  const clientName = (client || '').toUpperCase().trim() || 'NOMBRE DEL CLIENTE';
  return `Cotización ${seq} LEM-GEOFAL-${clientName}`;
}

function generateQuoteCode() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `COT-${year}${month}${day}-${random}`;
}

const normalizeKey = (s = '') => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim();

const VARIANT_TEXTS = {
  [normalizeKey('MUESTRA DE SUELO Y AGREGADO')]: `CONDICIONES ESPECÍFICAS:\n- El cliente debe enviar al laboratorio, para los ensayo en suelo y agregados, la cantidad minima de 100 kg por cada muestra.\n- El cliente deberá de entregar las muestras debidamente identificadas.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.\n- El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.`,
  [normalizeKey('PROBETAS')]: `CONDICIONES ESPECÍFICAS:\n- El cliente debe proporcionar las probetas antes del ingreso a obra.\n- El cliente deberá de entregar las muestras debidamente identificadas.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.\n- El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.`,
  [normalizeKey('DENSIDAD DE CAMPO Y MUESTREO')]: `CONDICIONES ESPECÍFICAS:\n- El cliente deberá enviar al laboratorio, para los ensayo en suelo y agregados, la cantidad minima de 100 kg por cada muestra.\n- Para el ensayo de Densidad de campo, la cantidad de puntos/salida minimo 4 und.\n- El cliente deberá de programar el servicio, Densidad de campo, con 24 horas de anticipación.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.\n- El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.`,
  [normalizeKey('EXTRACCIÓN DE DIAMANTINA')]: `CONDICIONES ESPECÍFICAS:\n- Movilización y desmovilización de equipos y del personal técnico, estara a cargo de GEOFAL.\n- Resane de estructura de concreto con sika rep 500 y Sikadur 32, estara a cargo de GEOFAL.\n- El servicio no incluye trabajos de acabados como pintura, mayolica y otros.\n- El area de trabajo, zona de extracción de diamantina, tiene que estar libre de interferencia.\n- La extracción de diamantina se realizara en 2 dia en campo, en laboratorio se realizará el tallado y refrentado de diamantina, el ensayo de resistencia a la compresión de testigo de diamantina se realizara en 5 dias (el tiempo de ensayo obedece a la normativa vigente).\n- Costo de resane insumos 250 soles, este costo se distribuira de acuerdo con el numero de perforaciones Donde se hara las extracciones de diamantina`,
  [normalizeKey('DIAMANTINA PARA PASES')]: `CONDICIONES ESPECÍFICAS:\n- El cliente deberá de programar el servicio, Extracción diamantina, con 24 horas de anticipación.\n- El area de trabajo, zona de extraccion de diamantina, debera estar libre de interferencia.\n- Para extraer la diamantina, se ubicara el acero con un escaneador.\n- Movilizacion y desmovilizacion de equipos y del personal tecnico, estara a cargo de Geofal.`,
  [normalizeKey('ALBAÑILERÍA')]: `CONDICIONES ESPECÍFICAS:\n- El cliente deberá enviar al laboratorio, 20 ladrillo de cada tipo, en buen estado y sin presentar fisuras.\n- El cliente deberá de entregar las muestras debidamente identificadas.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.\n- El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima`,
  [normalizeKey('VIGA BECKELMAN')]: `CONDICIONES ESPECÍFICAS:\n- El cliente deberá de programar el servicio, Ensayo de Deflexión, con 24 horas de anticipación.\n- El area de trabajo tiene que estar habilitado.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP o MTC vigente de acuerdo con el alcance del laboratorio.\n- Especificar las caracteristicas del camion`,
  [normalizeKey('CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA')]: `CONDICIONES ESPECÍFICAS:\n- El cliente deberá de programar el servicio, con 24 horas de anticipación.\n- Para el ensayo de control de calidad de concreto fresco en obra, se moldeara 6 probetas, ensayo slump, control de temperatura, en laboratorio las probetas se colocara en camara de curado, el ensayo de compresión de las probetas seran 3 a 7 dias y 3 a 28 dias.\n- El control de calidad del concreto fresco se sacara cada 50m3 a uno de los mixer donde se hara todos los ensayos respectivos mencionados, o por dia asi no se halla llegado los 50m3.\n- El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.`,
};

const getVariantText = (v) => {
  const t = normalizeKey(v?.title || '');
  if (VARIANT_TEXTS[t]) return VARIANT_TEXTS[t];
  const entry = Object.entries(VARIANT_TEXTS).find(([k]) => t.includes(k) || k.includes(t));
  return entry ? entry[1] : '';
};

export default function CotizacionInteligente() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editQuoteId = searchParams.get('edit');
  
  const [variants, setVariants] = useState([]);
  const [variantId, setVariantId] = useState('');
  const [client, setClient] = useState(emptyClient);
  const [selection, setSelection] = useState({ company_id: null, project_id: null, company: null, project: null });
  const [quote, setQuote] = useState(emptyQuote);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [itemBackups, setItemBackups] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [lastSavedId, setLastSavedId] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [projectSuggestions, setProjectSuggestions] = useState([]);

  // Efecto para restaurar automáticamente campos borrados
  useEffect(() => {
    const restoreFields = () => {
      let needsRestore = false;
      const updatedItems = items.map((item, idx) => {
        if (itemBackups[idx] && itemBackups[idx].code && itemBackups[idx].norm) {
          if (!item.code || !item.norm) {
            needsRestore = true;
            return {
              ...item,
              code: itemBackups[idx].code,
              norm: itemBackups[idx].norm
            };
          }
        }
        return item;
      });
      
      if (needsRestore) {
        setItems(updatedItems);
      }
    };

    restoreFields();
  }, [items, itemBackups]);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [suggestedFileName, setSuggestedFileName] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estados para el buscador de clientes
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Estados para el modal de selección de proyecto
  const [showProjectSelectionModal, setShowProjectSelectionModal] = useState(false);
  const [pendingProjectName, setPendingProjectName] = useState('');
  const [pendingCompanyId, setPendingCompanyId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  // Etiquetas predefinidas para referencia
  const referenceTypes = [
    { value: 'email', label: '📧 Correo electrónico', icon: '📧' },
    { value: 'phone', label: '📞 Llamada telefónica', icon: '📞' },
    { value: 'ticket', label: '🎯 Sistema de tickets', icon: '🎯' },
    { value: 'meeting', label: '🤝 Reunión presencial', icon: '🤝' },
    { value: 'form', label: '📋 Formulario web', icon: '📋' },
    { value: 'referral', label: '👥 Referido', icon: '👥' },
    { value: 'other', label: '📝 Otro', icon: '📝' }
  ];

  // Cargar variantes
  useEffect(() => {
    const fallback = [
      { id: 'V1', code: 'V1', title: 'MUESTRA DE SUELO Y AGREGADO', description: getVariantText({ title: 'MUESTRA DE SUELO Y AGREGADO' }) },
      { id: 'V2', code: 'V2', title: 'PROBETAS', description: getVariantText({ title: 'PROBETAS' }) },
      { id: 'V3', code: 'V3', title: 'DENSIDAD DE CAMPO Y MUESTREO', description: getVariantText({ title: 'DENSIDAD DE CAMPO Y MUESTREO' }) },
      { id: 'V4', code: 'V4', title: 'EXTRACCIÓN DE DIAMANTINA', description: getVariantText({ title: 'EXTRACCIÓN DE DIAMANTINA' }) },
      { id: 'V5', code: 'V5', title: 'DIAMANTINA PARA PASES', description: getVariantText({ title: 'DIAMANTINA PARA PASES' }) },
      { id: 'V6', code: 'V6', title: 'ALBAÑILERÍA', description: getVariantText({ title: 'ALBAÑILERÍA' }) },
      { id: 'V7', code: 'V7', title: 'VIGA BECKELMAN', description: getVariantText({ title: 'VIGA BECKELMAN' }) },
      { id: 'V8', code: 'V8', title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA', description: getVariantText({ title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA' }) },
    ];
    setVariants(fallback);
  }, []);

  // Cargar proyectos existentes
  useEffect(() => {
    (async () => {
      try {
        const response = await listProjects({ page: 1, limit: 100 });
        const projects = response.data || [];
        setAllProjects(projects);
        setProjectSuggestions(projects);
      } catch (e) {
        console.warn('No se pudieron cargar proyectos existentes:', e);
        setAllProjects([]);
        setProjectSuggestions([]);
      }
    })();
  }, []);

  // Auto-completar datos del cliente cuando se selecciona
  useEffect(() => {
    if (selection.company) {
      setClient(prev => ({
        ...prev,
        company_name: selection.company.name || prev.company_name,
        ruc: selection.company.ruc || prev.ruc,
        contact_name: selection.company.contact_name || prev.contact_name,
        contact_phone: selection.company.phone || prev.contact_phone,
        contact_email: selection.company.email || prev.contact_email,
        project_location: selection.project?.location || prev.project_location,
        project_name: selection.project?.name || prev.project_name
      }));
    }
  }, [selection.company, selection.project]);

  // Auto-completar datos del asesor comercial desde el API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:4000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setCurrentUser(data.user); // Guardar usuario actual
            setQuote(prev => ({
              ...prev,
              commercial_name: data.user.name || prev.commercial_name,
              commercial_phone: data.user.phone || prev.commercial_phone,
              // Inicializar fecha de emisión con la fecha actual si está vacía
              issue_date: prev.issue_date || new Date().toISOString().slice(0, 10),
              // Inicializar fecha de solicitud con la fecha actual si está vacía
              request_date: prev.request_date || new Date().toISOString().slice(0, 10)
            }));
          }
        }
      } catch (e) {
        console.warn('No se pudo obtener datos del usuario:', e);
      }
    };
    
    loadUserData();
  }, []);


  // Autocompletar desde la variante seleccionada
  useEffect(() => {
    if (!variantId) return;
    const v = (variants || []).find(x => String(x.id) === String(variantId));
    if (!v) return;
    const c = v.conditions || {};
    setQuote(prev => ({
      ...prev,
      payment_terms: c.default_payment_terms || prev.payment_terms,
      igv: typeof c.default_igv === 'boolean' ? c.default_igv : prev.igv,
      reference: c.default_reference || prev.reference,
    }));
    const extra = getVariantText(v) || v.description || '';
    if (extra) setConditionsText(extra);
  }, [variantId]);

  const subtotal = useMemo(() => items.reduce((acc, it) => acc + computePartial(it), 0), [items]);
  const igvAmount = useMemo(() => (quote.igv ? Number((subtotal * 0.18).toFixed(2)) : 0), [subtotal, quote.igv]);
  const total = useMemo(() => Number((subtotal + igvAmount).toFixed(2)), [subtotal, igvAmount]);

  const onAddItem = () => setItems([...items, { ...emptyItem }]);
  const onRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const onChangeItem = (idx, patch) => {
    const currentItem = items[idx];
    const newItem = { ...currentItem, ...patch };
    
    // SIEMPRE preservar código y norma si ya existen y solo se está actualizando la descripción
    if (patch.description && !patch.code && !patch.norm && currentItem.code && currentItem.norm) {
      newItem.code = currentItem.code;
      newItem.norm = currentItem.norm;
    }
    
    // Detectar si se borraron campos importantes y restaurarlos automáticamente
    if (currentItem.code && currentItem.norm && (!newItem.code || !newItem.norm)) {
      // Restaurar automáticamente los campos borrados
      if (!newItem.code && currentItem.code) {
        newItem.code = currentItem.code;
      }
      if (!newItem.norm && currentItem.norm) {
        newItem.norm = currentItem.norm;
      }
    }
    
    const newItems = items.map((it, i) => (i === idx ? newItem : it));
    setItems(newItems);
  };

  // Funciones para el buscador de clientes
  const fetchClients = async () => {
    try {
      const clientsData = await listCompanies({ limit: 500 });
      const clientsList = clientsData?.data || clientsData || [];
      
      setClients(clientsList);
    } catch (err) {
      console.error('❌ Error fetching clients:', err);
      setError('Error al cargar los clientes: ' + (err.message || 'Error desconocido'));
      setClients([]);
    }
  };

  const handleClientSearch = (searchTerm) => {
    console.log('🔍 handleClientSearch - Término de búsqueda:', searchTerm);
    setClientSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setFilteredClients([]);
      setShowClientDropdown(false);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    console.log('🔍 handleClientSearch - Búsqueda en minúsculas:', searchLower);
    
    const filtered = clients.filter(client => {
      const nameMatch = client.name?.toLowerCase().includes(searchLower);
      const rucMatch = client.ruc?.toLowerCase().includes(searchLower);
      const emailMatch = client.email?.toLowerCase().includes(searchLower);
      const phoneMatch = client.phone?.toLowerCase().includes(searchLower);
      
      // Búsqueda por palabras individuales
      const nameWordsMatch = client.name?.toLowerCase().split(' ').some(word => 
        word.includes(searchLower)
      );
      
      const match = nameMatch || rucMatch || emailMatch || phoneMatch || nameWordsMatch;
      
      if (match) {
        console.log('✅ Cliente encontrado:', client.name, '- Match:', { nameMatch, nameWordsMatch, rucMatch, emailMatch, phoneMatch });
      }
      
      return match;
    });
    
    console.log('🔍 handleClientSearch - Resultados encontrados:', filtered.length);
    setFilteredClients(filtered);
    setShowClientDropdown(true);
  };

  const handleClientSelect = (client) => {
    console.log('🔍 handleClientSelect - Cliente seleccionado:', client.name, 'ID:', client.id);
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
    
    // Llenar automáticamente los campos del cliente
    setClient(prev => ({
      ...prev,
      company_name: client.name || '',
      ruc: client.ruc || '',
      contact_name: client.contact_name || '',
      contact_phone: client.phone || '',
      contact_email: client.email || '',
      project_location: client.address || ''
    }));
    
    console.log('✅ Campos del cliente llenados automáticamente:', {
      company_name: client.name,
      ruc: client.ruc,
      contact_name: client.contact_name,
      contact_phone: client.phone,
      contact_email: client.email,
      project_location: client.address
    });
  };

  const handleClientClear = () => {
    console.log('🔍 handleClientClear - Limpiando selección de cliente');
    setSelectedClient(null);
    setClientSearch('');
    setShowClientDropdown(false);
    setClient(emptyClient);
  };


  // Cargar cotización existente para edición
  useEffect(() => {
    if (editQuoteId && clients.length > 0) {
      loadExistingQuote(editQuoteId);
    }
  }, [editQuoteId, clients]);

  const loadExistingQuote = async (quoteId) => {
    setLoadingQuote(true);
    try {
      console.log('🔄 Cargando cotización existente:', quoteId);
      const existingQuote = await getQuote(quoteId);
      console.log('✅ Cotización cargada:', existingQuote);
      
      // Si no tenemos datos del usuario, cargarlos
      if (!currentUser) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await fetch('http://localhost:4000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                setCurrentUser(data.user);
                console.log('✅ Usuario cargado para edición:', data.user);
              }
            }
          }
        } catch (e) {
          console.warn('No se pudo obtener datos del usuario para edición:', e);
        }
      }
      
      // Parsear meta si viene como string JSON
      if (existingQuote.meta && typeof existingQuote.meta === 'string') {
        try {
          existingQuote.meta = JSON.parse(existingQuote.meta);
          console.log('✅ Meta parseado correctamente:', existingQuote.meta);
        } catch (error) {
          console.error('❌ Error parseando meta:', error);
          existingQuote.meta = {};
        }
      }
      
      // Cargar datos del cliente
      if (existingQuote.client_contact || existingQuote.company_name) {
        // Usar company_name del JOIN con companies (razón social real) como prioridad
        const companyName = existingQuote.company_name || existingQuote.client_company || existingQuote.client_contact || '';
        const contactName = existingQuote.client_contact || '';
        
        setClient(prev => ({
          ...prev,
          company_name: companyName, // ✅ Usar la razón social real de la empresa
          ruc: existingQuote.company_ruc || existingQuote.client_ruc || '', // ✅ Usar RUC de la empresa
          contact_name: contactName,
          contact_phone: existingQuote.client_phone || '',
          contact_email: existingQuote.client_email || '',
          project_location: existingQuote.project_location || '',
          project_name: existingQuote.project_name || ''
        }));
        
        // Configurar el campo de búsqueda de clientes con la razón social
        setClientSearch(companyName);
        console.log('🔍 Configurando búsqueda de cliente:', companyName);
        console.log('🔍 RUC del cliente:', existingQuote.company_ruc || existingQuote.client_ruc);
        console.log('🔍 Teléfono del cliente:', existingQuote.client_phone);
        
        // Si hay RUC, buscar el cliente en la lista
        const rucToSearch = existingQuote.company_ruc || existingQuote.client_ruc;
        if (rucToSearch) {
          console.log('🔍 Buscando cliente por RUC:', rucToSearch);
          const foundClient = clients.find(c => c.ruc === rucToSearch);
          if (foundClient) {
            console.log('✅ Cliente encontrado:', foundClient);
            setSelectedClient(foundClient);
          } else {
            console.log('❌ Cliente no encontrado en la lista, creando cliente simulado');
            // Si no se encuentra el cliente, crear un objeto simulado con los datos de la cotización
            const simulatedClient = {
              id: 'existing',
              name: companyName,
              ruc: rucToSearch || '',
              email: existingQuote.client_email || '',
              phone: existingQuote.client_phone || '',
              contact_name: contactName,
              address: existingQuote.project_location || ''
            };
            setSelectedClient(simulatedClient);
            console.log('✅ Cliente simulado creado:', simulatedClient);
          }
        } else {
          // Si no hay RUC pero hay nombre de cliente, crear cliente simulado
          const simulatedClient = {
            id: 'existing',
            name: companyName,
            ruc: '',
            email: existingQuote.client_email || '',
            phone: existingQuote.client_phone || '',
            contact_name: contactName,
            address: existingQuote.project_location || ''
          };
          setSelectedClient(simulatedClient);
          console.log('✅ Cliente simulado creado (sin RUC):', simulatedClient);
        }
      }
      
      // Cargar datos de la cotización
      const deliveryDaysValue = existingQuote.meta?.quote?.delivery_days || existingQuote.delivery_days || 4;
      
      setQuote(prev => ({
        ...prev,
        request_date: existingQuote.meta?.quote?.request_date || existingQuote.request_date || new Date().toISOString().slice(0, 10),
        issue_date: existingQuote.issue_date || new Date().toISOString().slice(0, 10), // Mantener fecha original o usar actual
        commercial_name: existingQuote.commercial_name || currentUser?.name || '',
        commercial_phone: existingQuote.commercial_phone || currentUser?.phone || '',
        payment_terms: existingQuote.payment_terms || 'adelantado',
        reference: existingQuote.reference || '',
        reference_type: existingQuote.reference_type || ['email', 'phone'],
        igv: existingQuote.igv !== false,
        delivery_days: deliveryDaysValue, // Mantener días hábiles originales
        category_main: existingQuote.category_main || 'laboratorio'
      }));
      
      // Cargar items si existen (desde meta.items)
      let itemsToLoad = [];
      if (existingQuote.meta && existingQuote.meta.items && existingQuote.meta.items.length > 0) {
        itemsToLoad = existingQuote.meta.items;
        console.log('✅ Cargando ítems desde meta.items:', itemsToLoad.length);
      } else if (existingQuote.items && existingQuote.items.length > 0) {
        itemsToLoad = existingQuote.items;
        console.log('✅ Cargando ítems desde items directo:', itemsToLoad.length);
      }
      
      if (itemsToLoad.length > 0) {
        setItems(itemsToLoad);
        console.log('📦 Ítems cargados para edición:', itemsToLoad);
      } else {
        console.log('📦 No hay ítems para cargar, usando ítem vacío por defecto');
        setItems([{ ...emptyItem }]);
      }
      
      // Cargar variante si existe
      if (existingQuote.variant_id) {
        setVariantId(existingQuote.variant_id);
        console.log('🔄 Variante cargada:', existingQuote.variant_id);
      }
      
      // Cargar condiciones específicas si existen
      if (existingQuote.meta && existingQuote.meta.conditions_text) {
        setConditionsText(existingQuote.meta.conditions_text);
        console.log('📝 Condiciones específicas cargadas');
      }
      
      // ✅ NUEVO: Cargar project_id para preservar el proyecto original
      if (existingQuote.project_id) {
        setSelection(prev => ({
          ...prev,
          project_id: existingQuote.project_id
        }));
        console.log('✅ Project ID cargado para edición:', existingQuote.project_id);
      }
      
      console.log('✅ Datos de cotización cargados para edición');
    } catch (error) {
      console.error('❌ Error cargando cotización:', error);
      setError('Error al cargar la cotización existente: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoadingQuote(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  // Manejar cliente pre-seleccionado desde la navegación
  useEffect(() => {
    if (location.state?.selectedClient && clients.length > 0) {
      const preSelectedClient = location.state.selectedClient;
      console.log('🎯 Cliente pre-seleccionado desde navegación:', preSelectedClient);
      
      // Buscar el cliente en la lista cargada
      const foundClient = clients.find(c => c.id === preSelectedClient.id);
      if (foundClient) {
        console.log('✅ Cliente encontrado en la lista, pre-llenando datos');
        setSelectedClient(foundClient);
        setClientSearch(foundClient.name);
        
        // Pre-llenar los campos del cliente
        setClient(prev => ({
          ...prev,
          company_name: foundClient.name || '',
          ruc: foundClient.ruc || foundClient.dni || '',
          contact_name: foundClient.contact_name || '',
          contact_phone: foundClient.phone || '',
          contact_email: foundClient.email || '',
          project_location: foundClient.address || ''
        }));
      } else {
        console.log('⚠️ Cliente no encontrado en la lista, usando datos de navegación');
        // Si no se encuentra en la lista, usar los datos de navegación
        setSelectedClient(preSelectedClient);
        setClientSearch(preSelectedClient.name);
        
        // Pre-llenar los campos del cliente
        setClient(prev => ({
          ...prev,
          company_name: preSelectedClient.name || '',
          ruc: preSelectedClient.ruc || preSelectedClient.dni || '',
          contact_name: preSelectedClient.contact_name || '',
          contact_phone: preSelectedClient.phone || '',
          contact_email: preSelectedClient.email || '',
          project_location: preSelectedClient.address || ''
        }));
      }
    }
  }, [location.state?.selectedClient, clients]);

  // Cleanup timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);


  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!client.company_name) {
        throw new Error('Debe ingresar al menos el nombre de la empresa');
      }
      
      let projectId = selection.project?.id || selection.project_id;
      let companyId = selection.company?.id;
      
      // Si no hay empresa seleccionada, crear una automáticamente
      if (!companyId) {
        if (!client.ruc) {
          throw new Error('Debe ingresar el RUC de la empresa');
        }
        
        // Obtener o crear empresa automáticamente
        const newCompany = await getOrCreateCompany({
          type: 'empresa',
          ruc: client.ruc,
          name: client.company_name,
          address: client.project_location || '',
          email: client.contact_email || '',
          phone: client.contact_phone || '',
          contact_name: client.contact_name || '',
          city: client.project_location || '',
          sector: 'servicios'
        });
        
        companyId = newCompany.id;
        console.log('✅ Empresa obtenida/creada:', newCompany);
      }
      
      // Si no hay proyecto seleccionado, crear uno automáticamente
      if (!projectId) {
        // Crear proyecto automáticamente con vendedor asignado
        const newProject = await createProject({
          company_id: companyId,
          name: client.project_name || `Proyecto ${client.company_name}`,
          location: client.project_location || 'Por definir',
          contact_name: client.contact_name,
          contact_phone: client.contact_phone,
          contact_email: client.contact_email,
          status: 'activo',
          priority: 'normal',
          // Asignar automáticamente el vendedor que creó la cotización
          vendedor_id: currentUser?.id || null,
          // Si es categoría laboratorio, permitir asignar usuario de laboratorio
          requiere_laboratorio: quote.category_main === 'laboratorio',
          laboratorio_status: quote.category_main === 'laboratorio' ? 'pendiente' : 'no_requerido'
        });
        
        projectId = newProject.id;
        console.log('✅ Proyecto creado automáticamente:', newProject);
        console.log('👤 Vendedor asignado:', currentUser?.name);
      }
      
      const quoteCode = generateQuoteCode();
      
      const payload = {
        project_id: projectId,
        variant_id: variantId || null,
        client_contact: client.contact_name,
        client_email: client.contact_email,
        client_phone: client.contact_phone,
        client_company: client.company_name, // ✅ NUEVO: Razón social de la empresa
        client_ruc: client.ruc, // ✅ NUEVO: RUC de la empresa
        project_name: client.project_name, // ✅ NUEVO: Nombre del proyecto
        project_location: client.project_location, // ✅ NUEVO: Ubicación del proyecto
        request_date: quote.request_date || new Date().toISOString().slice(0, 10), // ✅ NUEVO: Fecha de solicitud
        issue_date: quote.issue_date || new Date().toISOString().slice(0, 10),
        subtotal,
        igv: igvAmount,
        total,
        status: 'borrador',
        reference: quote.reference,
        reference_type: JSON.stringify(quote.reference_type),
        category_main: quote.category_main, // ✅ NUEVO: Categoría principal
        quote_code: quoteCode, // ✅ NUEVO: Código único
        meta: JSON.stringify({
          customer: client,
          quote: {
            ...quote,
            request_date: quote.request_date || new Date().toISOString().slice(0, 10),
            delivery_days: quote.delivery_days || 4,
            reference: quote.reference,
            category_main: quote.category_main, // ✅ NUEVO: Categoría en meta
            quote_code: quoteCode // ✅ NUEVO: Código en meta
          },
          items: items, // Agregar ítems al meta
          conditions_text: conditionsText,
          payment_terms: quote.payment_terms,
          file_name: suggestedFileName || `Cotización ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')} LEM-GEOFAL-${client.company_name?.toUpperCase() || 'CLIENTE'}`,
        })
      };
      
      let saved;
      let successMessage;
      
      if (editQuoteId) {
        // Actualizar cotización existente
        saved = await updateQuote(editQuoteId, payload);
        successMessage = 'Cotización actualizada exitosamente';
        console.log('✅ Cotización actualizada:', saved);
      } else {
        // Crear nueva cotización
        saved = await createQuote(payload);
        successMessage = 'Cotización creada exitosamente';
        console.log('✅ Nueva cotización creada:', saved);
      }
      
      // Mostrar modal de éxito con los datos
      setSuccessData({
        code: quoteCode,
        category: quote.category_main === 'laboratorio' ? '🧪 Laboratorio' : '⚙️ Ingeniería',
        itemsCount: items.length,
        total: total.toLocaleString(),
        isEdit: !!editQuoteId,
        message: successMessage
      });
      setShowSuccessModal(true);
      setLastSavedId(saved.id);
    } catch (e) {
      console.error('Error:', e);
      setError(e.message || 'Error al crear cotización');
    } finally {
      setSaving(false);
    }
  };

  const exportFile = async (type) => {
    try {
      const id = lastSavedId;
      if (!id) return alert('Guarde la cotización antes de exportar');
      
      const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const path = `/api/quotes/${id}/export/${type}`;
      const url = base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
      
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      // Preparar datos del formulario actual
      const formData = {
        variant_id: variantId,
        delivery_days: quote.delivery_days,
        meta: {
          customer: client,
          quote: {
            ...quote,
            delivery_days: quote.delivery_days,
            variant_id: variantId
          },
          items: items,
          conditions_text: conditionsText,
          payment_terms: quote.payment_terms
        },
        items: items
      };
      
      console.log('🔍 exportFile - Enviando datos:', formData);
      
      // Realizar la petición con los datos del formulario
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `cotizacion-${id}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (e) {
      console.error('Error al exportar:', e);
      alert(`No se pudo exportar: ${e.message}`);
    }
  };

  const exportDraft = async () => {
    try {
      const id = lastSavedId;
      if (!id) return alert('Guarde la cotización antes de generar el borrador');
      
      const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const path = `/api/quotes/${id}/export/pdf-draft`;
      const url = base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
      
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      // Preparar datos del formulario actual
      const formData = {
        variant_id: variantId,
        delivery_days: quote.delivery_days,
        meta: {
          customer: client,
          quote: {
            ...quote,
            delivery_days: quote.delivery_days,
            variant_id: variantId
          },
          items: items,
          conditions_text: conditionsText,
          payment_terms: quote.payment_terms
        },
        items: items
      };
      
      console.log('🔍 exportDraft - Enviando datos:', formData);
      
      // Realizar la petición con los datos del formulario
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      // Generar nombre en formato COT-DDMMYY-YY
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const fileName = `COT-${day}${month}${year}-${year}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (e) {
      console.error('Error al exportar borrador:', e);
      alert(`No se pudo exportar borrador: ${e.message}`);
    }
  };

  // Función para detectar proyectos existentes cuando el usuario termina de escribir
  const handleProjectNameChange = (value) => {
    setClient({...client, project_name: value});
    
    // Detectar automáticamente si hay proyectos duplicados
    if (value && value.trim().length >= 3) {
      const companyId = selection.company?.id || selectedClient?.id;
      if (companyId) {
        // Verificar si hay proyectos existentes con este nombre
        checkForDuplicateProjects(value.trim(), companyId);
      }
    }
  };

  // Función para verificar proyectos duplicados automáticamente
  const checkForDuplicateProjects = async (projectName, companyId) => {
    try {
      const projects = await searchProjectsByName(projectName, companyId);
      if (projects && projects.length > 0) {
        // Mostrar advertencia visual
        setDuplicateWarning({
          count: projects.length,
          suggestedName: `${projectName} (${projects.length + 1})`
        });
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error('Error verificando proyectos duplicados:', error);
      setDuplicateWarning(null);
    }
  };

  // Función para verificar proyectos existentes manualmente
  const checkExistingProjects = async () => {
    const projectName = client.project_name?.trim();
    
    if (!projectName || projectName.length < 3) {
      alert('Por favor ingresa al menos 3 caracteres en el nombre del proyecto');
      return;
    }
    
    // Buscar la empresa seleccionada en diferentes lugares
    let companyId = selection.company?.id;
    
    // Si no está en selection, buscar en selectedClient
    if (!companyId && selectedClient) {
      companyId = selectedClient.id;
    }
    
    // Si aún no hay companyId, mostrar error más específico
    if (!companyId) {
      alert('Por favor selecciona una empresa primero usando el buscador de clientes');
      return;
    }
    
    console.log('🔍 Verificando proyectos existentes para:', projectName, 'empresa:', companyId);
    console.log('🔍 selectedClient:', selectedClient);
    console.log('🔍 selection.company:', selection.company);
    
    setPendingProjectName(projectName);
    setPendingCompanyId(companyId);
    setShowProjectSelectionModal(true);
  };

  // Función para continuar con un proyecto existente
  const handleSelectExistingProject = (project) => {
    console.log('🔄 Seleccionando proyecto existente:', project);
    
    setSelection(prev => ({
      ...prev,
      project: project,
      project_id: project.id
    }));
    
    // Actualizar los datos del cliente con la información del proyecto
    setClient(prev => ({
      ...prev,
      project_name: project.name,
      project_location: project.location || prev.project_location
    }));
    
    // Limpiar la advertencia de duplicados
    setDuplicateWarning(null);
    
    console.log('✅ Proyecto existente seleccionado y estado actualizado:', project);
  };

  // Función para crear un nuevo proyecto
  const handleCreateNewProject = (differentiatedName = null) => {
    console.log('🔄 Creando nuevo proyecto:', differentiatedName);
    
    // Limpiar la selección de proyecto para que se cree uno nuevo
    setSelection(prev => ({
      ...prev,
      project: null,
      project_id: null
    }));
    
    // Si se proporciona un nombre diferenciado, actualizarlo en el campo
    if (differentiatedName) {
      setClient(prev => ({
        ...prev,
        project_name: differentiatedName
      }));
      console.log('✅ Se creará un nuevo proyecto con nombre diferenciado:', differentiatedName);
    } else {
      console.log('✅ Se creará un nuevo proyecto con nombre original');
    }
    
    // Limpiar la advertencia de duplicados
    setDuplicateWarning(null);
  };

  return (
    <ModuloBase 
      titulo={editQuoteId ? "📝 Editar Cotización" : "📋 Cotización Inteligente"} 
      descripcion={editQuoteId ? "Edita una cotización existente con nueva fecha" : "Formulario unificado para crear cotizaciones de forma rápida e intuitiva"}
    >
      {loadingQuote && (
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando cotización existente...
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="intelligent-quote-form">
        <div className="alert alert-light border mt-3 intelligent-intro">
          <h5>🚀 Flujo Simplificado</h5>
          <p className="mb-0">Completa los datos del cliente, proyecto y cotización. Usa el botón "💾 GUARDAR COTIZACIÓN" para guardar tu trabajo.</p>
        </div>

        {/* Sección Cliente */}
        <div className="intelligent-section">
          <div className="section-header">
            <span className="section-icon">🏢</span>
            <h4>CLIENTE</h4>
            <span className="section-status">
              {client.company_name ? '✅ Cliente configurado' : '⏳ Pendiente'}
            </span>
          </div>
          <div className="section-content">
            {/* Buscador de Clientes */}
            <div className="row g-3 mb-4">
              <div className="col-md-12">
                <label className="form-label">Buscar Cliente Existente</label>
                <div className="position-relative">
                  <input 
                    type="text"
                    className="form-control" 
                    value={clientSearch}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="Buscar por nombre, RUC, email o teléfono..."
                  />
                  {selectedClient && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                      onClick={handleClientClear}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {clientSearch && showClientDropdown && filteredClients.length > 0 && (
                  <div className="border rounded mt-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    <div className="p-2 bg-light border-bottom">
                      <small className="text-muted">
                        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                    {filteredClients.map((clientItem) => (
                      <div
                        key={clientItem.id}
                        className="p-2 border-bottom cursor-pointer hover-bg-light"
                        onClick={() => handleClientSelect(clientItem)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="fw-bold">{clientItem.name}</div>
                        <small className="text-muted">
                          RUC: {clientItem.ruc} | Email: {clientItem.email}
                          {clientItem.phone && ` | Tel: ${clientItem.phone}`}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {clientSearch && showClientDropdown && filteredClients.length === 0 && (
                  <div className="border rounded mt-2 p-3 text-center">
                    <small className="text-muted">
                      No se encontraron clientes con "{clientSearch}"
                    </small>
                  </div>
                )}
                {selectedClient && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <strong>Cliente seleccionado:</strong> {selectedClient.name}
                    <br />
                    <small className="text-muted">
                      RUC: {selectedClient.ruc} | Email: {selectedClient.email}
                      {selectedClient.phone && ` | Tel: ${selectedClient.phone}`}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Campos del Cliente */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Empresa</label>
                <input 
                  className="form-control" 
                  value={client.company_name} 
                  onChange={e => setClient({...client, company_name: e.target.value})} 
                  required 
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">R.U.C. *</label>
                <input 
                  className="form-control" 
                  value={client.ruc} 
                  onChange={e => setClient({...client, ruc: e.target.value})} 
                  placeholder="RUC de la empresa"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contacto</label>
                <input 
                  className="form-control" 
                  value={client.contact_name} 
                  onChange={e => setClient({...client, contact_name: e.target.value})} 
                  required 
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input 
                  className="form-control" 
                  value={client.contact_phone} 
                  onChange={e => setClient({...client, contact_phone: e.target.value})} 
                  placeholder="Teléfono del contacto"
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Correo</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={client.contact_email} 
                  onChange={e => setClient({...client, contact_email: e.target.value})} 
                  placeholder="Correo del contacto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección Proyecto */}
        <div className="intelligent-section">
          <div className="section-header">
            <span className="section-icon">📁</span>
            <h4>PROYECTO</h4>
            <span className="section-status">
              {client.project_name ? '✅ Proyecto configurado' : '⏳ Pendiente'}
            </span>
          </div>
          <div className="section-content">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Nombre del Proyecto
                  {selection.project && (
                    <span className="badge bg-success ms-2">
                      ✅ Proyecto existente seleccionado
                    </span>
                  )}
                </label>
                <div className="input-group">
                  <input 
                    className={`form-control ${duplicateWarning ? 'is-warning' : selection.project ? 'is-success' : ''}`}
                    value={client.project_name} 
                    onChange={e => handleProjectNameChange(e.target.value)} 
                    required 
                    placeholder="Nombre del proyecto"
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-info"
                    onClick={checkExistingProjects}
                    title="Verificar si ya existen proyectos con este nombre"
                  >
                    🔍 Verificar
                  </button>
                </div>
                {duplicateWarning && (
                  <div className="alert alert-warning mt-2 mb-0">
                    <strong>⚠️ Advertencia:</strong> Se encontraron {duplicateWarning.count} proyecto(s) con este nombre.
                    <br />
                    <small>
                      Sugerencia: <code>{duplicateWarning.suggestedName}</code>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-warning ms-2"
                        onClick={() => {
                          setClient(prev => ({
                            ...prev,
                            project_name: duplicateWarning.suggestedName
                          }));
                          setDuplicateWarning(null);
                        }}
                      >
                        Usar sugerencia
                      </button>
                    </small>
                  </div>
                )}
                {selection.project && (
                  <div className="alert alert-success mt-2 mb-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>✅ Proyecto existente seleccionado:</strong> {selection.project.name}
                        <br />
                        <small>
                          Ubicación: {selection.project.location || 'No especificada'} | 
                          Vendedor: {selection.project.vendedor_name || 'No asignado'} |
                          Cotizaciones: {selection.project.quotes_count || 0}
                        </small>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelection(prev => ({
                            ...prev,
                            project: null,
                            project_id: null
                          }));
                          console.log('🔄 Proyecto existente deseleccionado');
                        }}
                        title="Deseleccionar proyecto existente"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Ubicación</label>
                <input 
                  className="form-control" 
                  value={client.project_location} 
                  onChange={e => setClient({...client, project_location: e.target.value})} 
                  placeholder="Ubicación del proyecto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección Cotización */}
        <div className="intelligent-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h4>COTIZACIÓN</h4>
            <span className="section-status">
              {variantId ? '✅ Variante seleccionada' : '⏳ Pendiente'}
            </span>
          </div>
          <div className="section-content">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Fecha de Solicitud</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={quote.request_date} 
                  onChange={e => setQuote({...quote, request_date: e.target.value})} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha de Emisión</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={quote.issue_date} 
                  onChange={e => setQuote({...quote, issue_date: e.target.value})} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Comercial</label>
                <input 
                  className="form-control" 
                  value={quote.commercial_name} 
                  onChange={e => setQuote({...quote, commercial_name: e.target.value})} 
                  placeholder="Nombre del comercial"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono Comercial</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={quote.commercial_phone} 
                  onChange={e => setQuote({...quote, commercial_phone: e.target.value})} 
                  required 
                  placeholder="Teléfono del comercial"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Variante</label>
                <select 
                  className="form-select" 
                  value={variantId} 
                  onChange={e => setVariantId(e.target.value)}
                >
                  <option value="">Seleccionar variante</option>
                  {(variants || []).map(v => (
                    <option key={v.id} value={v.id}>{v.code} - {v.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Forma de Pago</label>
                <select 
                  className="form-select" 
                  value={quote.payment_terms} 
                  onChange={e => setQuote({...quote, payment_terms: e.target.value})}
                >
                  <option value="adelantado">Adelantado</option>
                  <option value="50%">Adelanto 50% y saldo previo al informe</option>
                  <option value="credito7">Crédito 7 días con OS</option>
                  <option value="credito15">Crédito 15 días con OS</option>
                  <option value="credito30">Crédito 30 días con OS</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Días Hábiles</label>
                <input 
                  key={`delivery-days-${quote.delivery_days}`}
                  type="number" 
                  className="form-control" 
                  value={quote.delivery_days || 4} 
                  onChange={e => {
                    const newValue = parseInt(e.target.value) || 4;
                    setQuote(prev => ({...prev, delivery_days: newValue}));
                  }} 
                  min="1"
                  max="30"
                />
                <small className="text-muted">Estado actual: {quote.delivery_days}</small>
              </div>
              <div className="col-md-6">
                <div className="form-check mt-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="igv" 
                    checked={quote.igv} 
                    onChange={e => setQuote({...quote, igv: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="igv">
                    Aplicar IGV 18%
                  </label>
                </div>
              </div>
            </div>

            {/* Referencia */}
            <div className="mt-3">
              <label className="form-label">Referencia</label>
              <input 
                className="form-control" 
                value={quote.reference} 
                onChange={e => setQuote({...quote, reference: e.target.value})} 
                placeholder="SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA"
              />
            </div>

            {/* Selector de Categoría Principal */}
            <div className="mt-4">
              <label className="form-label">Categoría Principal</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="categoryMain" 
                      id="laboratorio" 
                      value="laboratorio"
                      checked={quote.category_main === 'laboratorio'}
                      onChange={e => setQuote({...quote, category_main: e.target.value})}
                    />
                    <label className="form-check-label" htmlFor="laboratorio">
                      🧪 Laboratorio
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="categoryMain" 
                      id="ingenieria" 
                      value="ingenieria"
                      checked={quote.category_main === 'ingenieria'}
                      onChange={e => setQuote({...quote, category_main: e.target.value})}
                    />
                    <label className="form-check-label" htmlFor="ingenieria">
                      ⚙️ Ingeniería
                    </label>
                  </div>
                </div>
              </div>
              <div className="alert alert-info mt-2">
                <small>
                  <strong>💡 Importante:</strong> Selecciona la categoría principal para que el sistema pueda categorizar automáticamente los ítems y alimentar el embudo de ventas.
                </small>
              </div>
            </div>

            {/* Condiciones específicas */}
            <div className="mt-3">
              <label className="form-label">Condiciones Específicas</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Las condiciones se auto-completan según la variante seleccionada"
                value={conditionsText}
                onChange={e => setConditionsText(e.target.value)}
              />
            </div>

            {/* Ítems */}
            <div className="mt-4">
              <label className="form-label">Ítems de la Cotización</label>
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th style={{width: '10%'}}>Código</th>
                      <th style={{width: '35%'}}>Descripción</th>
                      <th style={{width: '15%'}}>Norma</th>
                      <th style={{width: '12%'}}>Precio Unit.</th>
                      <th style={{width: '10%'}}>Cantidad</th>
                      <th style={{width: '12%'}}>Parcial</th>
                      <th style={{width: '6%'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <input 
                            className="form-control form-control-sm" 
                            value={it.code} 
                            onChange={e => onChangeItem(idx, { code: e.target.value })}
                            placeholder="Código"
                          />
                        </td>
                        <td>
                          <SubserviceAutocompleteFinal
                            value={it.description}
                            onChange={(value) => {
                              // No actualizar si se está realizando una selección
                              if (isSelectingItem) {
                                return;
                              }
                              
                              // Permitir escritura normal - el sistema restaurará automáticamente si es necesario
                              onChangeItem(idx, { description: value });
                            }}
                            onSelect={(subservice) => {
                              if (subservice) {
                                // Crear backup de los campos importantes
                                setItemBackups(prev => ({
                                  ...prev,
                                  [idx]: {
                                    code: subservice.codigo,
                                    norm: subservice.norma
                                  }
                                }));
                                
                                // Marcar que se está realizando una selección para evitar sobrescritura
                                setIsSelectingItem(true);
                                onChangeItem(idx, {
                                  code: subservice.codigo,
                                  description: subservice.descripcion,
                                  norm: subservice.norma,
                                  unit_price: subservice.precio
                                });
                                // Limpiar la bandera después de un breve delay
                                setTimeout(() => {
                                  setIsSelectingItem(false);
                                }, 100);
                              }
                            }}
                            onDependenciesSelect={(dependencyItems) => {
                              // Agregar ensayos dependientes automáticamente
                              const newItems = dependencyItems.map(dep => ({
                                code: dep.codigo,
                                description: dep.descripcion,
                                norm: dep.norma,
                                unit_price: dep.precio,
                                quantity: 1
                              }));
                              
                              // Agregar los nuevos items después del item actual
                              const currentItems = [...items];
                              currentItems.splice(idx + 1, 0, ...newItems);
                              setItems(currentItems);
                            }}
                            placeholder="Buscar servicio..."
                            size="sm"
                          />
                        </td>
                        <td>
                          <input 
                            className="form-control form-control-sm" 
                            value={it.norm} 
                            onChange={e => onChangeItem(idx, { norm: e.target.value })}
                            placeholder="Norma"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="form-control form-control-sm" 
                            value={it.unit_price} 
                            onChange={e => onChangeItem(idx, { unit_price: e.target.value })}
                            placeholder="0.00"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            value={it.quantity} 
                            onChange={e => onChangeItem(idx, { quantity: e.target.value })}
                            min="1"
                          />
                        </td>
                        <td>
                          <span className="fw-bold text-success">S/ {computePartial(it).toFixed(2)}</span>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => onRemoveItem(idx)} 
                            disabled={items.length === 1}
                            title="Eliminar ítem"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button type="button" className="btn btn-outline-primary" onClick={onAddItem}>
                  ➕ Agregar ítem
                </button>
                <div className="text-end">
                  <div className="h6 mb-1">Subtotal: <span className="text-primary">S/ {subtotal.toFixed(2)}</span></div>
                  <div className="h6 mb-1">IGV 18%: <span className="text-primary">S/ {igvAmount.toFixed(2)}</span></div>
                  <div className="h5 mb-0">Total: <span className="text-success fw-bold">S/ {total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Botones de acción */}
        <div className="intelligent-actions">
          <button 
            type="submit" 
            className="btn btn-success btn-lg"
            disabled={saving || !client.company_name || !client.ruc}
          >
            {saving ? (editQuoteId ? '🔄 Actualizando...' : '💾 Guardando...') : (editQuoteId ? '🔄 GUARDAR CAMBIOS' : '💾 CREAR COTIZACIÓN')}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-warning btn-lg"
            onClick={exportDraft}
            disabled={!lastSavedId}
          >
            📄 Generar cotización
          </button>
        </div>
      </form>
      
      {/* Modal de éxito */}
      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        data={successData}
        buttonText="Aceptar"
      />

      {/* Modal de selección de proyecto */}
      <ProjectSelectionModal
        show={showProjectSelectionModal}
        onHide={() => setShowProjectSelectionModal(false)}
        projectName={pendingProjectName}
        companyId={pendingCompanyId}
        onSelectExisting={handleSelectExistingProject}
        onCreateNew={handleCreateNewProject}
      />
    </ModuloBase>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
// import { listVariants } from '../services/quoteVariants'; // Módulo eliminado
import { createQuote } from '../services/quotes';
import { getExistingServices, listProjects } from '../services/projects';
import CompanyProjectPicker from '../components/CompanyProjectPicker';
import SubserviceAutocomplete from '../components/SubserviceAutocomplete';
import './CotizacionNuevaLEM.css';
import '../styles/autocomplete.css';

const emptyClient = {
  company_name: '', ruc: '', contact_name: '', contact_phone: '', contact_email: '',
  project_location: '', project_name: '',
};

const emptyQuote = {
  request_date: '', issue_date: '', commercial_name: '', payment_terms: 'adelantado', acceptance: false, reference: '', reference_type: ['email', 'phone'], igv: true, delivery_days: 4,
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
  // intento de match por inclusión si el título difiere levemente
  const entry = Object.entries(VARIANT_TEXTS).find(([k]) => t.includes(k) || k.includes(t));
  return entry ? entry[1] : '';
};

export default function CotizacionNuevaLEM() {
  const [variants, setVariants] = useState([]);
  const [variantId, setVariantId] = useState('');
  const [client, setClient] = useState(emptyClient);
  const [selection, setSelection] = useState({ company_id: null, project_id: null, company: null, project: null });
  const [quote, setQuote] = useState(emptyQuote);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Cliente/Proyecto, 2: Condiciones, 3: Ítems, 4: Resumen
  const [lastSavedId, setLastSavedId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // allServices eliminado - no sirve
  // Funciones de servicio eliminadas - no sirven
  const [allProjects, setAllProjects] = useState([]);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [suggestedFileName, setSuggestedFileName] = useState('');
  
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

  // Cargar variantes desde API con fallback local
  useEffect(() => {
    (async () => {
      try {
        // const v = await listVariants({ active: true }); // Módulo eliminado
        const v = []; // Array vacío temporal
        const loaded = v || [];
        if (loaded.length > 0) {
          setVariants(loaded);
        } else {
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
        }
      } catch {
        setVariants([
          { id: 'V1', code: 'V1', title: 'MUESTRA DE SUELO Y AGREGADO', description: getVariantText({ title: 'MUESTRA DE SUELO Y AGREGADO' }) },
          { id: 'V2', code: 'V2', title: 'PROBETAS', description: getVariantText({ title: 'PROBETAS' }) },
          { id: 'V3', code: 'V3', title: 'DENSIDAD DE CAMPO Y MUESTREO', description: getVariantText({ title: 'DENSIDAD DE CAMPO Y MUESTREO' }) },
          { id: 'V4', code: 'V4', title: 'EXTRACCIÓN DE DIAMANTINA', description: getVariantText({ title: 'EXTRACCIÓN DE DIAMANTINA' }) },
          { id: 'V5', code: 'V5', title: 'DIAMANTINA PARA PASES', description: getVariantText({ title: 'DIAMANTINA PARA PASES' }) },
          { id: 'V6', code: 'V6', title: 'ALBAÑILERÍA', description: getVariantText({ title: 'ALBAÑILERÍA' }) },
          { id: 'V7', code: 'V7', title: 'VIGA BECKELMAN', description: getVariantText({ title: 'VIGA BECKELMAN' }) },
          { id: 'V8', code: 'V8', title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA', description: getVariantText({ title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA' }) },
        ]);
      }
    })();
  }, []);

  // Carga de servicios eliminada - no sirve

  // Cargar proyectos existentes para autocompletado
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

  // Detectar estado del sidebar
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      }
    };

    // Verificar estado inicial
    checkSidebarState();

    // Observar cambios en el sidebar
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  // Autocompletar datos del cliente cuando se selecciona en CompanyProjectPicker
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

  // Auto-completar datos del asesor comercial según el usuario logueado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.name) {
          setQuote(prev => ({
            ...prev,
            commercial_name: payload.name
          }));
        }
      } catch (e) {
        console.warn('No se pudo decodificar el token:', e);
      }
    }
  }, []);

  // Generar nombre de archivo automáticamente cuando cambien los datos del cliente
  useEffect(() => {
    if (client.company_name) {
      const fileName = generateFileName();
      setSuggestedFileName(fileName);
    }
  }, [client.company_name]);

  // Generar texto de referencia automáticamente cuando cambien las etiquetas
  useEffect(() => {
    if (quote.reference_type && quote.reference_type.length > 0) {
      const referenceText = generateReferenceText(quote.reference_type);
      setQuote(prev => ({ ...prev, reference: referenceText }));
    }
  }, [quote.reference_type]);

  // Inicializar texto de referencia por defecto
  useEffect(() => {
    if (quote.reference_type && quote.reference_type.length > 0 && !quote.reference) {
      const referenceText = generateReferenceText(quote.reference_type);
      setQuote(prev => ({ ...prev, reference: referenceText }));
    }
  }, []);

  // Funciones de servicio eliminadas - no sirven

  // Funciones para manejar autocompletado de proyectos
  const handleProjectInputChange = (e) => {
    const value = e.target.value;
    setClient(prev => ({ ...prev, project_name: value }));
    
    if (value.length > 0) {
      const filtered = allProjects.filter(project => 
        project.name.toLowerCase().includes(value.toLowerCase())
      );
      setProjectSuggestions(filtered);
      setShowProjectSuggestions(true);
    } else {
      setProjectSuggestions(allProjects);
      setShowProjectSuggestions(false);
    }
  };

  const handleProjectSuggestionClick = (projectName) => {
    setClient(prev => ({ ...prev, project_name: projectName }));
    setShowProjectSuggestions(false);
  };

  const handleProjectBlur = () => {
    // Delay para permitir que se ejecute el click en la sugerencia
    setTimeout(() => setShowProjectSuggestions(false), 200);
  };

  // Generar nombre de archivo automáticamente
  const generateFileName = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const currentDay = String(new Date().getDate()).padStart(2, '0');
    
    // Generar código de cotización
    const quoteCode = `COT-${currentYear}-${currentMonth}${currentDay}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Obtener nombre del cliente (limpio para archivo)
    const clientName = client.company_name || 'CLIENTE';
    const cleanClientName = clientName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .toUpperCase()
      .substring(0, 30); // Limitar longitud
    
    return `${quoteCode} LEM-GEOFAL-${cleanClientName}`;
  };

  // Generar texto de referencia automáticamente
  const generateReferenceText = (selectedTypes) => {
    if (!selectedTypes || selectedTypes.length === 0) {
      return 'SEGÚN LO SOLICITADO';
    }
    
    const typeLabels = selectedTypes.map(type => {
      const refType = referenceTypes.find(rt => rt.value === type);
      return refType ? refType.label.replace(/^[^\s]+\s/, '') : type; // Remover emoji
    });
    
    if (typeLabels.length === 1) {
      return `SEGÚN LO SOLICITADO VÍA ${typeLabels[0].toUpperCase()}`;
    } else if (typeLabels.length === 2) {
      return `SEGÚN LO SOLICITADO VÍA ${typeLabels[0].toUpperCase()} / ${typeLabels[1].toUpperCase()}`;
    } else {
      const lastType = typeLabels.pop();
      return `SEGÚN LO SOLICITADO VÍA ${typeLabels.join(', ').toUpperCase()} Y ${lastType.toUpperCase()}`;
    }
  };

  const subtotal = useMemo(() => items.reduce((acc, it) => acc + computePartial(it), 0), [items]);
  const igvAmount = useMemo(() => (quote.igv ? Number((subtotal * 0.18).toFixed(2)) : 0), [subtotal, quote.igv]);
  const total = useMemo(() => Number((subtotal + igvAmount).toFixed(2)), [subtotal, igvAmount]);

  const onAddItem = () => setItems([...items, { ...emptyItem }]);
  const onRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const onChangeItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  // Autocompletar campos desde la variante seleccionada
  useEffect(() => {
    if (!variantId) return;
    const v = (variants || []).find(x => String(x.id) === String(variantId));
    if (!v) return;
    const c = v.conditions || {};
    setQuote(prev => ({
      ...prev,
      payment_terms: c.default_payment_terms || prev.payment_terms,
      acceptance: typeof c.default_acceptance === 'boolean' ? c.default_acceptance : prev.acceptance,
      igv: typeof c.default_igv === 'boolean' ? c.default_igv : prev.igv,
      reference: c.default_reference || prev.reference,
    }));
    // Autollenar textarea de Condiciones específicas con el texto exacto
    const extra = getVariantText(v) || v.description || '';
    if (extra) setConditionsText(extra);
    if (Array.isArray(c.default_items) && items.length <= 1 && !items[0].code && !items[0].description && !items[0].norm) {
      const mapped = c.default_items.map(di => ({
        code: di.code || '',
        description: di.description || '',
        norm: di.norm || '',
        unit_price: Number(di.unit_price || 0),
        quantity: Number(di.quantity || 1),
      }));
      if (mapped.length) setItems(mapped);
    }
    // Campo service_name eliminado - no sirve
  }, [variantId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      console.log('🔍 onSubmit - Iniciando creación de cotización...');
      console.log('🔍 onSubmit - Selection:', selection);
      console.log('🔍 onSubmit - Client:', client);
      console.log('🔍 onSubmit - Quote:', quote);
      
      // Validar que tenemos un proyecto seleccionado
      const projectId = selection.project?.id || selection.project_id;
      if (!projectId) {
        throw new Error('Debe seleccionar un proyecto para crear la cotización');
      }
      
      console.log('🔍 onSubmit - Project ID validado:', projectId);
      
      // Construir payload de cotización base
      const payload = {
        project_id: projectId,
        variant_id: variantId || null, // Mantener como string (V1, V2, etc.)
        client_contact: client.contact_name,
        client_email: client.contact_email,
        client_phone: client.contact_phone,
        issue_date: quote.issue_date || new Date().toISOString().slice(0, 10),
        subtotal,
        igv: igvAmount,
        total,
        status: 'borrador',
        reference: quote.reference,
        reference_type: JSON.stringify(quote.reference_type),
        // campos adicionales útiles
        meta: JSON.stringify({
          customer: client,
          quote: {
            ...quote,
            delivery_days: quote.delivery_days || 4
          },
          conditions_text: conditionsText,
          payment_terms: quote.payment_terms,
          acceptance: quote.acceptance,
          file_name: suggestedFileName || generateFileName(),
        })
      };
      
      console.log('🔍 onSubmit - Payload:', payload);
      console.log('🔍 onSubmit - Meta type:', typeof payload.meta);
      console.log('🔍 onSubmit - Reference Type type:', typeof payload.reference_type);
      console.log('🔍 onSubmit - Meta content:', payload.meta);
      console.log('🔍 onSubmit - Reference Type content:', payload.reference_type);
      
      const saved = await createQuote(payload);
      console.log('✅ onSubmit - Cotización creada:', saved);
      
      // Los ítems se manejan directamente en el frontend
      // No es necesario enviarlos al backend por separado
      console.log('📋 Ítems de la cotización:', items);
      
      alert('Cotización creada exitosamente');
      // Guardar id para exportaciones
      setLastSavedId(saved.id);
      // Redirigir a detalle/edición en el futuro
    } catch (e) {
      console.error('❌ onSubmit - Error:', e);
      setError(e.message || 'Error al crear cotización');
    } finally {
      setSaving(false);
    }
  };

  const exportFile = async (type) => {
    try {
      const id = lastSavedId; // en futuro usar id de ruta/estado
      if (!id) return alert('Guarde la cotización antes de exportar');
      
      const base = import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const path = `/api/quotes/${id}/export/${type}`;
      const url = base && /\/api$/i.test(base) ? `${base}${path.replace(/^\/api/, '')}` : `${base}${path}`;
      
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
        return;
      }
      
      // Crear enlace con token para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion_${id}.${type}`;
      
      // Enviar ítems junto con la petición
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items // Enviar los ítems actuales
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
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
        alert('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
        return;
      }
      
      // Crear enlace con token para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `borrador_cotizacion_${id}.pdf`;
      
      // Enviar ítems junto con la petición
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items // Enviar los ítems actuales
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
    } catch (e) {
      console.error('Error al generar borrador:', e);
      alert(`No se pudo generar el borrador: ${e.message}`);
    }
  };

  return (
    <ModuloBase titulo="Nueva Cotización LEM" descripcion="Plantilla de cotización para Laboratorio con variantes y condiciones">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit} className="lem-quote-page">
        <div className="alert alert-light border mt-3 lem-intro">
          Completa el formulario para crear una nueva cotización del Laboratorio (LEM). Los campos están agrupados por sección para facilitar el flujo.
        </div>

        {/* Stepper */}
        <div className="lem-stepper card shadow-sm mt-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center lem-steps">
              {[
                { id: 1, label: 'Cliente y Proyecto' },
                { id: 2, label: 'Condiciones' },
                { id: 3, label: 'Ítems' },
                { id: 4, label: 'Resumen' },
              ].map(s => (
                <div
                  key={s.id}
                  className={`lem-step ${currentStep===s.id?'active':''} ${currentStep>s.id?'done':''}`}
                  onClick={()=>setCurrentStep(s.id)}
                  role="button"
                >
                  <div className="lem-step-index">{s.id}</div>
                  <div className="lem-step-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paso 1: Cliente, Proyecto y Datos de Cotización */}
        {currentStep === 1 && (
          <div className="row g-4 mt-3">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header py-2">
                  <strong>Proyecto</strong>
                  <div className="lem-subtitle">Selecciona la empresa y el proyecto al que se asociará la cotización.</div>
                </div>
                <div className="card-body">
                  <CompanyProjectPicker value={selection} onChange={setSelection} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header py-2">
                  <strong>Datos del Cliente</strong>
                  <div className="lem-subtitle">Información del cliente vinculada a esta cotización.</div>
                  {selection.company && (
                    <div className="alert alert-info py-1 mt-2 mb-0">
                      <small>✅ Datos autocompletados desde la selección de cliente</small>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="mb-3"><label className="form-label">Empresa</label><input className="form-control" value={client.company_name} onChange={e=>setClient({...client, company_name:e.target.value})} required/><div className="form-text">Razón social o nombre comercial del cliente.</div></div>
                  <div className="mb-3"><label className="form-label">R.U.C.</label><input className="form-control" value={client.ruc} onChange={e=>setClient({...client, ruc:e.target.value})} /><div className="form-text">RUC de la empresa (si aplica). Para persona natural, deja vacío.</div></div>
                  <div className="mb-3"><label className="form-label">Contacto</label><input className="form-control" value={client.contact_name} onChange={e=>setClient({...client, contact_name:e.target.value})} required/><div className="form-text">Nombre de la persona que solicita la cotización.</div></div>
                  <div className="mb-3"><label className="form-label">Teléfono</label><input className="form-control" value={client.contact_phone} onChange={e=>setClient({...client, contact_phone:e.target.value})} /><div className="form-text">Teléfono del contacto para coordinaciones.</div></div>
                  <div className="mb-3"><label className="form-label">Correo</label><input type="email" className="form-control" value={client.contact_email} onChange={e=>setClient({...client, contact_email:e.target.value})} /><div className="form-text">Correo del contacto para envío de la cotización.</div></div>
                  <div className="mb-3">
                    <label className="form-label">Ubicación del proyecto</label>
                    <input 
                      className="form-control" 
                      value={client.project_location} 
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                    />
                    <div className="form-text">Se actualiza automáticamente desde la selección de arriba</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre del proyecto</label>
                    <input 
                      className="form-control" 
                      value={client.project_name} 
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                    />
                    <div className="form-text">Se actualiza automáticamente desde la selección de arriba</div>
                  </div>
                  {/* Campo "Nombre del servicio" eliminado - no sirve */}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header py-2">
                  <strong>Datos de la Cotización</strong>
                  <div className="lem-subtitle">Fechas, referencia y configuración principal.</div>
                </div>
                <div className="card-body">
                  <div className="mb-3"><label className="form-label">Fecha de Solicitud</label><input type="date" className="form-control" value={quote.request_date} onChange={e=>setQuote({...quote, request_date:e.target.value})} /></div>
                  <div className="mb-3"><label className="form-label">Fecha de Emisión</label><input type="date" className="form-control" value={quote.issue_date} onChange={e=>setQuote({...quote, issue_date:e.target.value})} /></div>
                  <div className="mb-3"><label className="form-label">Comercial</label><input className="form-control" value={quote.commercial_name} onChange={e=>setQuote({...quote, commercial_name:e.target.value})} /><div className="form-text">Nombre del asesor comercial que atiende al cliente.</div></div>
                  <div className="mb-3"><label className="form-label">Días de Entrega</label><input type="number" className="form-control" value={quote.delivery_days || 4} onChange={e=>setQuote({...quote, delivery_days:parseInt(e.target.value) || 4})} min="1" max="30" /><div className="form-text">Número de días hábiles para entrega de resultados.</div></div>
                  <div className="mb-3">
                    <label className="form-label">Referencia</label>
                    <div className="mb-2">
                      <div className="row g-2">
                        {referenceTypes.map(type => (
                          <div key={type.value} className="col-md-3 col-sm-4 col-6">
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id={`ref-${type.value}`}
                                checked={quote.reference_type?.includes(type.value) || false}
                                onChange={(e) => {
                                  const currentTypes = quote.reference_type || [];
                                  if (e.target.checked) {
                                    setQuote({
                                      ...quote, 
                                      reference_type: [...currentTypes, type.value]
                                    });
                                  } else {
                                    setQuote({
                                      ...quote, 
                                      reference_type: currentTypes.filter(t => t !== type.value)
                                    });
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`ref-${type.value}`}>
                                {type.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="input-group">
                      <input 
                        className="form-control" 
                        value={quote.reference} 
                        onChange={e => setQuote({...quote, reference: e.target.value})} 
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => {
                          const referenceText = generateReferenceText(quote.reference_type);
                          setQuote(prev => ({ ...prev, reference: referenceText }));
                        }}
                        title="Regenerar texto de referencia"
                      >
                        🔄
                      </button>
                    </div>
                    <div className="form-text">Se genera automáticamente basado en las etiquetas seleccionadas. Puedes editarlo si necesitas.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Variante</label>
                    <div className="d-flex gap-2 align-items-center">
                      <select className="form-select" value={variantId} onChange={(e)=>setVariantId(e.target.value)} style={{maxWidth:'70%'}}>
                        <option value="">Sin variante</option>
                        {(variants||[]).map(v => <option key={v.id} value={v.id}>{v.code} - {v.title}</option>)}
                      </select>
                      {variantId ? (
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>{ setVariantId(''); setConditionsText(''); }}>
                          Quitar
                        </button>
                      ) : null}
                    </div>
                    {variantId ? (()=>{
                      const v = (variants||[]).find(x=>String(x.id)===String(variantId));
                      if (!v) return null;
                      const extra = getVariantText(v) || v.description || '';
                      return (
                        <div className="alert alert-info mt-2 p-2">
                          <div className="fw-semibold small">{v.code} - {v.title}</div>
                          {extra ? <div className="small text-muted" style={{whiteSpace:'pre-line'}}>{extra}</div> : null}
                        </div>
                      );
                    })() : <div className="form-text">Selecciona una variante del listado.</div>}
                  </div>
                  <div className="mb-3"><label className="form-label">Forma de pago</label>
                    <select className="form-select" value={quote.payment_terms} onChange={e=>setQuote({...quote, payment_terms:e.target.value})}>
                      <option value="adelantado">Adelantado</option>
                      <option value="50%">Adelanto 50% y saldo previo al informe</option>
                      <option value="credito7">Crédito 7 días con OS</option>
                      <option value="credito15">Crédito 15 días con OS</option>
                      <option value="credito30">Crédito 30 días con OS</option>
                    </select>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="igv" checked={quote.igv} onChange={e=>setQuote({...quote, igv: e.target.checked})}/>
                    <label className="form-check-label" htmlFor="igv">Aplicar IGV 18%</label>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="acceptance" checked={quote.acceptance} onChange={e=>setQuote({...quote, acceptance:e.target.checked})}/>
                    <label className="form-check-label" htmlFor="acceptance">Aceptación de cotización</label>
                  </div>
                  <div className="mb-0">
                    <label className="form-label">Nombre de archivo sugerido</label>
                    <div className="input-group">
                      <input 
                        className="form-control" 
                        value={suggestedFileName} 
                        onChange={(e) => setSuggestedFileName(e.target.value)}
                        placeholder="Se genera automáticamente..."
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSuggestedFileName(generateFileName())}
                        title="Regenerar nombre automáticamente"
                      >
                        🔄
                      </button>
                    </div>
                    <div className="form-text">Se genera automáticamente basado en el cliente. Puedes editarlo si necesitas.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Condiciones específicas y ajustes */}
        {currentStep === 2 && (
          <div className="card shadow-sm lem-section-gap">
            <div className="card-header py-2">
              <strong>Condiciones específicas</strong>
              <div className="lem-subtitle">Se auto-completan según la variante; puedes editarlas.</div>
            </div>
            <div className="card-body">
              <textarea
                className="form-control lem-monospace"
                rows={8}
                placeholder="Aquí aparecerán las condiciones de la variante seleccionada; puedes editarlas si es necesario."
                value={conditionsText}
                onChange={(e)=>setConditionsText(e.target.value)}
              />
              <div className="form-text mt-2">Este texto se guardará en la cotización y se usará para PDF/Excel.</div>
            </div>
          </div>
        )}

        {/* Modal eliminado: la selección se hace solo con el menú desplegable */}

        {currentStep === 3 && (
          <div className="card shadow-sm mt-4">
            <div className="card-header py-2">
              <strong>Ítems</strong>
              <div className="lem-subtitle">Detalle de ensayos/servicios cotizados.</div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Código/N° ensayo</th>
                      <th>Descripción</th>
                      <th>Norma</th>
                      <th className="text-right">Unitario (S/)</th>
                      <th className="text-right">Cantidad</th>
                      <th className="text-right">Parcial (S/)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td><input className="form-control" value={it.code} onChange={e=>onChangeItem(idx, { code: e.target.value })} /></td>
                        <td>
                          <SubserviceAutocomplete
                            value={it.description}
                            onChange={(value) => onChangeItem(idx, { description: value })}
                            onSelect={(subservice) => {
                              if (subservice) {
                                onChangeItem(idx, {
                                  code: subservice.codigo,
                                  description: subservice.descripcion,
                                  norm: subservice.norma,
                                  unit_price: subservice.precio
                                });
                              }
                            }}
                            placeholder="Buscar por código, descripción o norma..."
                            size="sm"
                          />
                        </td>
                        <td><input className="form-control" value={it.norm} onChange={e=>onChangeItem(idx, { norm: e.target.value })} /></td>
                        <td style={{ width: 120 }}><input type="number" step="0.01" className="form-control" value={it.unit_price} onChange={e=>onChangeItem(idx, { unit_price: e.target.value })} /></td>
                        <td style={{ width: 100 }}><input type="number" className="form-control" value={it.quantity} onChange={e=>onChangeItem(idx, { quantity: e.target.value })} /></td>
                        <td style={{ width: 120 }}>{computePartial(it)}</td>
                        <td style={{ width: 80 }}>
                          <button type="button" className="btn btn-sm btn-link text-danger" title="Eliminar" onClick={()=>onRemoveItem(idx)} disabled={items.length===1}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mb-2">
                <button type="button" className="btn btn-outline-primary" onClick={onAddItem}>Agregar ítem</button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="card shadow-sm mt-3 mb-2">
            <div className="card-header py-2">
              <strong>Resumen y Acciones</strong>
              <div className="lem-subtitle">Revisa montos y genera tus archivos.</div>
            </div>
            <div className="card-body">
              <div className="row align-items-center g-3">
                <div className="col-md">
                  <div className="text-md-end">
                    <div>Subtotal: S/ {subtotal.toFixed(2)}</div>
                    <div>IGV 18%: S/ {igvAmount.toFixed(2)}</div>
                    <div><strong>Total: S/ {total.toFixed(2)}</strong></div>
                  </div>
                </div>
                <div className="col-md-auto">
                  {(!selection.project?.id && !selection.project_id) && (
                    <div className="alert alert-warning mb-2" style={{fontSize: '0.875rem'}}>
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Debe seleccionar un proyecto para poder guardar la cotización
                    </div>
                  )}
                  <div className="d-flex flex-wrap gap-2 lem-actions">
                    <button 
                      type="submit" 
                      className="btn btn-success" 
                      disabled={saving || (!selection.project?.id && !selection.project_id)}
                      title={(!selection.project?.id && !selection.project_id) ? 'Debe seleccionar un proyecto primero' : ''}
                    >
                      {saving ? 'Guardando...' : 'Guardar borrador'}
                    </button>
                    <button type="button" className="btn btn-outline-warning" onClick={exportDraft}>PDF Borrador</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('pdf')}>Exportar PDF</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('excel')}>Exportar Excel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky action bar integrada */}
        <div className={`lem-sticky-actions ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="lem-action-content">
            <div className="container-fluid px-0">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex gap-3">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={()=>setCurrentStep(Math.max(1, currentStep-1))} 
                      disabled={currentStep===1}
                    >
                      ← Anterior
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={()=> currentStep<4 ? setCurrentStep(currentStep+1) : onSubmit({ preventDefault: () => {} })}
                    >
                      {currentStep<4 ? 'Siguiente →' : (saving ? 'Guardando...' : 'Guardar borrador')}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                    <button type="button" className="btn btn-outline-warning" onClick={exportDraft}>
                      📄 PDF Borrador
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('pdf')}>
                      📋 Exportar PDF
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={()=>exportFile('excel')}>
                      📊 Exportar Excel
              </button>
            </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </ModuloBase>
  );
};

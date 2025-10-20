#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para subir clientes usando el endpoint de importación del CRM
Convierte los CSV a JSON y los sube usando el endpoint /api/client-import/import
"""

import pandas as pd
import requests
import json
import time
import os
from typing import Dict, List
import re

# Configuración
API_BASE_URL = "https://sublustrous-odelia-uninsured.ngrok-free.dev/api"
HEADERS = {
    'ngrok-skip-browser-warning': 'true'
}

# Datos predeterminados
DEFAULT_DATA = {
    'ciudad': 'Lima',
    'departamento': 'Lima',
    'pais': 'Perú',
    'tipo_cliente': 'Empresa',
    'estado': 'Activo',
    'origen': 'Importación CSV'
}

def clean_text(text: str) -> str:
    """Limpia y normaliza texto"""
    if pd.isna(text) or text == '' or text == '-':
        return ''
    return str(text).strip().replace('\n', ' ').replace('\r', ' ')

def clean_ruc(ruc: str) -> str:
    """Limpia y valida RUC"""
    if pd.isna(ruc) or ruc == '' or ruc == '-':
        return ''
    ruc_clean = re.sub(r'[^\d]', '', str(ruc))
    return ruc_clean if len(ruc_clean) == 11 else ''

def get_tipo_cliente(ruc: str) -> str:
    """Determina el tipo de cliente basado en el RUC"""
    if not ruc:
        return 'Empresa'
    
    # Si el RUC empieza con 10, es persona natural
    if ruc.startswith('10'):
        return 'Persona Natural'
    else:
        return 'Empresa'

def create_csv_from_data(data: List[Dict], filename: str) -> str:
    """Crea un archivo CSV temporal con los datos procesados"""
    df = pd.DataFrame(data)
    csv_path = f"temp_{filename}"
    df.to_csv(csv_path, index=False, encoding='utf-8')
    return csv_path

def get_existing_clients() -> Dict[str, str]:
    """Obtiene clientes existentes del CRM para evitar duplicados"""
    try:
        response = requests.get(f"{API_BASE_URL}/clients", headers=HEADERS)
        if response.status_code == 200:
            clients = response.json()
            existing = {}
            
            for client in clients:
                if client.get('ruc'):
                    existing[client['ruc']] = client.get('razon_social', '')
                if client.get('razon_social'):
                    existing[client['razon_social'].upper().strip()] = client.get('ruc', '')
            
            print(f"✅ Encontrados {len(existing)} clientes existentes para verificar duplicados")
            return existing
        else:
            print(f"⚠️ Error al obtener clientes existentes: {response.status_code}")
            return {}
    except Exception as e:
        print(f"❌ Error al conectar con la API: {e}")
        return {}

def upload_json_to_crm(data: List[Dict], description: str) -> bool:
    """Sube los datos JSON al CRM usando el endpoint de importación"""
    try:
        # Crear archivo CSV temporal
        csv_path = f"temp_{description.replace(' ', '_')}.csv"
        df = pd.DataFrame(data)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        
        with open(csv_path, 'rb') as file:
            files = {'file': (csv_path, file, 'text/csv')}
            response = requests.post(f"{API_BASE_URL}/client-import/import", 
                                   headers=HEADERS, 
                                   files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {description}: {result.get('message', 'Importación exitosa')}")
            if 'data' in result:
                data_result = result['data']
                print(f"   📊 Clientes creados: {data_result.get('created', 0)}")
                print(f"   ⏭️  Clientes saltados: {data_result.get('skipped', 0)}")
            return True
        else:
            print(f"❌ Error en {description}: {response.status_code}")
            if response.text:
                print(f"   Detalle: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error al subir {description}: {e}")
        return False
    finally:
        # Limpiar archivo temporal
        if os.path.exists(csv_path):
            os.remove(csv_path)

def process_clientes_vs_coso(file_path: str, existing_clients: Dict[str, str]) -> List[Dict]:
    """Procesa el archivo clientes_vs_coso_nuevo.csv y retorna datos para CSV"""
    print(f"\n📁 Procesando archivo: {file_path}")
    
    try:
        df = pd.read_csv(file_path)
        print(f"📊 Total de registros: {len(df)}")
        
        processed_data = []
        skipped_count = 0
        
        for index, row in df.iterrows():
            # Obtener datos del registro
            cliente_original = clean_text(row.get('cliente_original', ''))
            norm_name = clean_text(row.get('norm_name', ''))
            matched_razon = clean_text(row.get('matched_razon', ''))
            matched_ruc = clean_ruc(row.get('matched_ruc', ''))
            match_type = clean_text(row.get('match_type', ''))
            
            # Determinar nombre y RUC a usar
            if match_type in ['exact', 'partial'] and matched_razon and matched_ruc:
                # Usar datos del match
                razon_social = matched_razon
                ruc = matched_ruc
                nombre_contacto = cliente_original if cliente_original != matched_razon else ''
            else:
                # Usar datos originales
                razon_social = cliente_original or norm_name
                ruc = ''
                nombre_contacto = ''
            
            # Verificar duplicados
            if ruc and ruc in existing_clients:
                print(f"⏭️  Saltando por RUC duplicado: {ruc} - {razon_social}")
                skipped_count += 1
                continue
                
            if razon_social and razon_social.upper().strip() in existing_clients:
                print(f"⏭️  Saltando por razón social duplicada: {razon_social}")
                skipped_count += 1
                continue
            
            # Determinar tipo de cliente basado en RUC
            tipo_cliente = get_tipo_cliente(ruc)
            
            # Crear registro para CSV
            record = {
                'razon_social': razon_social,
                'ruc': ruc,
                'nombre_contacto': nombre_contacto,
                'ciudad': DEFAULT_DATA['ciudad'],
                'departamento': DEFAULT_DATA['departamento'],
                'pais': DEFAULT_DATA['pais'],
                'tipo_cliente': tipo_cliente,
                'estado': DEFAULT_DATA['estado'],
                'origen': f"{DEFAULT_DATA['origen']} - clientes_vs_coso",
                'observaciones': f"Match type: {match_type}, Source: {row.get('match_source', 'N/A')}"
            }
            
            processed_data.append(record)
            
            # Agregar a clientes existentes para evitar duplicados en el mismo proceso
            if ruc:
                existing_clients[ruc] = razon_social
            if razon_social:
                existing_clients[razon_social.upper().strip()] = ruc
        
        print(f"📊 Procesados: {len(processed_data)}, Saltados: {skipped_count}")
        return processed_data
        
    except Exception as e:
        print(f"❌ Error al procesar archivo {file_path}: {e}")
        return []

def process_control_vs_coso(file_path: str, existing_clients: Dict[str, str]) -> List[Dict]:
    """Procesa el archivo control_vs_coso_matches.csv y retorna datos para CSV"""
    print(f"\n📁 Procesando archivo: {file_path}")
    
    try:
        df = pd.read_csv(file_path)
        print(f"📊 Total de registros: {len(df)}")
        
        processed_data = []
        skipped_count = 0
        
        for index, row in df.iterrows():
            # Obtener datos del registro
            control_name = clean_text(row.get('control_name', ''))
            norm_name = clean_text(row.get('norm_name', ''))
            matched_razon = clean_text(row.get('matched_razon', ''))
            matched_ruc = clean_ruc(row.get('matched_ruc', ''))
            match_type = clean_text(row.get('match_type', ''))
            
            # Determinar nombre y RUC a usar
            if match_type in ['exact', 'partial'] and matched_razon and matched_ruc:
                # Usar datos del match
                razon_social = matched_razon
                ruc = matched_ruc
                nombre_contacto = control_name if control_name != matched_razon else ''
            else:
                # Usar datos originales
                razon_social = control_name or norm_name
                ruc = ''
                nombre_contacto = ''
            
            # Verificar duplicados
            if ruc and ruc in existing_clients:
                print(f"⏭️  Saltando por RUC duplicado: {ruc} - {razon_social}")
                skipped_count += 1
                continue
                
            if razon_social and razon_social.upper().strip() in existing_clients:
                print(f"⏭️  Saltando por razón social duplicada: {razon_social}")
                skipped_count += 1
                continue
            
            # Determinar tipo de cliente basado en RUC
            tipo_cliente = get_tipo_cliente(ruc)
            
            # Crear registro para CSV
            record = {
                'razon_social': razon_social,
                'ruc': ruc,
                'nombre_contacto': nombre_contacto,
                'ciudad': DEFAULT_DATA['ciudad'],
                'departamento': DEFAULT_DATA['departamento'],
                'pais': DEFAULT_DATA['pais'],
                'tipo_cliente': tipo_cliente,
                'estado': DEFAULT_DATA['estado'],
                'origen': f"{DEFAULT_DATA['origen']} - control_vs_coso",
                'observaciones': f"Match type: {match_type}, Control name: {control_name}"
            }
            
            processed_data.append(record)
            
            # Agregar a clientes existentes para evitar duplicados en el mismo proceso
            if ruc:
                existing_clients[ruc] = razon_social
            if razon_social:
                existing_clients[razon_social.upper().strip()] = ruc
        
        print(f"📊 Procesados: {len(processed_data)}, Saltados: {skipped_count}")
        return processed_data
        
    except Exception as e:
        print(f"❌ Error al procesar archivo {file_path}: {e}")
        return []

def main():
    """Función principal"""
    print("🚀 Iniciando subida de clientes usando endpoint de importación")
    print("=" * 60)
    
    # Obtener clientes existentes para evitar duplicados
    print("📋 Obteniendo clientes existentes del CRM...")
    existing_clients = get_existing_clients()
    
    total_uploaded = 0
    total_failed = 0
    
    # Procesar primer archivo: clientes_vs_coso_nuevo.csv
    file1 = "Basedeclientes2025/clientes_vs_coso_nuevo.csv"
    if os.path.exists(file1):
        data1 = process_clientes_vs_coso(file1, existing_clients)
        if data1:
            if upload_json_to_crm(data1, "clientes_vs_coso_nuevo.csv"):
                total_uploaded += len(data1)
            else:
                total_failed += len(data1)
        else:
            print(f"❌ No se pudieron procesar datos de {file1}")
    else:
        print(f"❌ Archivo no encontrado: {file1}")
    
    # Pequeña pausa entre archivos
    time.sleep(2)
    
    # Procesar segundo archivo: control_vs_coso_matches.csv
    file2 = "Basedeclientes2025/control_vs_coso_matches.csv"
    if os.path.exists(file2):
        data2 = process_control_vs_coso(file2, existing_clients)
        if data2:
            if upload_json_to_crm(data2, "control_vs_coso_matches.csv"):
                total_uploaded += len(data2)
            else:
                total_failed += len(data2)
        else:
            print(f"❌ No se pudieron procesar datos de {file2}")
    else:
        print(f"❌ Archivo no encontrado: {file2}")
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE SUBIDA")
    print("=" * 60)
    print(f"✅ Registros procesados exitosamente: {total_uploaded}")
    print(f"❌ Registros fallidos: {total_failed}")
    print("\n🎉 Proceso completado!")

if __name__ == "__main__":
    main()

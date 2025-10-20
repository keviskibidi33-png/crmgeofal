#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importar clientes desde archivos CSV al CRM
Evita duplicados por RUC y razón social
Mantiene el orden de los archivos originales
"""

import pandas as pd
import requests
import json
import time
from typing import Dict, List, Set, Tuple
import re

# Configuración
API_BASE_URL = "https://sublustrous-odelia-uninsured.ngrok-free.dev/api"
HEADERS = {
    'Content-Type': 'application/json',
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

def get_existing_clients() -> Tuple[Set[str], Set[str]]:
    """Obtiene clientes existentes del CRM para evitar duplicados"""
    try:
        response = requests.get(f"{API_BASE_URL}/clients", headers=HEADERS)
        if response.status_code == 200:
            clients = response.json()
            existing_rucs = set()
            existing_razones = set()
            
            for client in clients:
                if client.get('ruc'):
                    existing_rucs.add(client['ruc'])
                if client.get('razon_social'):
                    existing_razones.add(client['razon_social'].upper().strip())
            
            print(f"✅ Encontrados {len(existing_rucs)} RUCs y {len(existing_razones)} razones sociales existentes")
            return existing_rucs, existing_razones
        else:
            print(f"⚠️ Error al obtener clientes existentes: {response.status_code}")
            return set(), set()
    except Exception as e:
        print(f"❌ Error al conectar con la API: {e}")
        return set(), set()

def create_client(client_data: Dict) -> bool:
    """Crea un cliente en el CRM"""
    try:
        response = requests.post(f"{API_BASE_URL}/clients", 
                               headers=HEADERS, 
                               json=client_data)
        
        if response.status_code == 201:
            print(f"✅ Cliente creado: {client_data.get('razon_social', 'Sin nombre')}")
            return True
        else:
            print(f"❌ Error al crear cliente {client_data.get('razon_social', 'Sin nombre')}: {response.status_code}")
            if response.text:
                print(f"   Detalle: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error al crear cliente {client_data.get('razon_social', 'Sin nombre')}: {e}")
        return False

def process_clientes_vs_coso(file_path: str, existing_rucs: Set[str], existing_razones: Set[str]) -> Tuple[int, int]:
    """Procesa el archivo clientes_vs_coso_nuevo.csv"""
    print(f"\n📁 Procesando archivo: {file_path}")
    
    try:
        df = pd.read_csv(file_path)
        print(f"📊 Total de registros: {len(df)}")
        
        created_count = 0
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
            if ruc and ruc in existing_rucs:
                print(f"⏭️  Saltando por RUC duplicado: {ruc} - {razon_social}")
                skipped_count += 1
                continue
                
            if razon_social and razon_social.upper().strip() in existing_razones:
                print(f"⏭️  Saltando por razón social duplicada: {razon_social}")
                skipped_count += 1
                continue
            
            # Crear cliente
            client_data = {
                'razon_social': razon_social,
                'ruc': ruc,
                'nombre_contacto': nombre_contacto,
                'ciudad': DEFAULT_DATA['ciudad'],
                'departamento': DEFAULT_DATA['departamento'],
                'pais': DEFAULT_DATA['pais'],
                'tipo_cliente': DEFAULT_DATA['tipo_cliente'],
                'estado': DEFAULT_DATA['estado'],
                'origen': f"{DEFAULT_DATA['origen']} - clientes_vs_coso",
                'observaciones': f"Match type: {match_type}, Source: {row.get('match_source', 'N/A')}"
            }
            
            if create_client(client_data):
                created_count += 1
                # Agregar a sets para evitar duplicados en el mismo proceso
                if ruc:
                    existing_rucs.add(ruc)
                if razon_social:
                    existing_razones.add(razon_social.upper().strip())
            
            # Pequeña pausa para no sobrecargar la API
            time.sleep(0.1)
        
        return created_count, skipped_count
        
    except Exception as e:
        print(f"❌ Error al procesar archivo {file_path}: {e}")
        return 0, 0

def process_control_vs_coso(file_path: str, existing_rucs: Set[str], existing_razones: Set[str]) -> Tuple[int, int]:
    """Procesa el archivo control_vs_coso_matches.csv"""
    print(f"\n📁 Procesando archivo: {file_path}")
    
    try:
        df = pd.read_csv(file_path)
        print(f"📊 Total de registros: {len(df)}")
        
        created_count = 0
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
            if ruc and ruc in existing_rucs:
                print(f"⏭️  Saltando por RUC duplicado: {ruc} - {razon_social}")
                skipped_count += 1
                continue
                
            if razon_social and razon_social.upper().strip() in existing_razones:
                print(f"⏭️  Saltando por razón social duplicada: {razon_social}")
                skipped_count += 1
                continue
            
            # Crear cliente
            client_data = {
                'razon_social': razon_social,
                'ruc': ruc,
                'nombre_contacto': nombre_contacto,
                'ciudad': DEFAULT_DATA['ciudad'],
                'departamento': DEFAULT_DATA['departamento'],
                'pais': DEFAULT_DATA['pais'],
                'tipo_cliente': DEFAULT_DATA['tipo_cliente'],
                'estado': DEFAULT_DATA['estado'],
                'origen': f"{DEFAULT_DATA['origen']} - control_vs_coso",
                'observaciones': f"Match type: {match_type}, Control name: {control_name}"
            }
            
            if create_client(client_data):
                created_count += 1
                # Agregar a sets para evitar duplicados en el mismo proceso
                if ruc:
                    existing_rucs.add(ruc)
                if razon_social:
                    existing_razones.add(razon_social.upper().strip())
            
            # Pequeña pausa para no sobrecargar la API
            time.sleep(0.1)
        
        return created_count, skipped_count
        
    except Exception as e:
        print(f"❌ Error al procesar archivo {file_path}: {e}")
        return 0, 0

def main():
    """Función principal"""
    print("🚀 Iniciando importación de clientes desde archivos CSV")
    print("=" * 60)
    
    # Obtener clientes existentes
    print("📋 Obteniendo clientes existentes del CRM...")
    existing_rucs, existing_razones = get_existing_clients()
    
    total_created = 0
    total_skipped = 0
    
    # Procesar primer archivo: clientes_vs_coso_nuevo.csv
    file1 = "Basedeclientes2025/clientes_vs_coso_nuevo.csv"
    created1, skipped1 = process_clientes_vs_coso(file1, existing_rucs, existing_razones)
    total_created += created1
    total_skipped += skipped1
    
    # Procesar segundo archivo: control_vs_coso_matches.csv
    file2 = "Basedeclientes2025/control_vs_coso_matches.csv"
    created2, skipped2 = process_control_vs_coso(file2, existing_rucs, existing_razones)
    total_created += created2
    total_skipped += skipped2
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE IMPORTACIÓN")
    print("=" * 60)
    print(f"✅ Clientes creados: {total_created}")
    print(f"⏭️  Clientes saltados (duplicados): {total_skipped}")
    print(f"📁 Archivo 1 ({file1}): {created1} creados, {skipped1} saltados")
    print(f"📁 Archivo 2 ({file2}): {created2} creados, {skipped2} saltados")
    print("\n🎉 Importación completada!")

if __name__ == "__main__":
    main()

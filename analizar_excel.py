import pandas as pd
import os
from pathlib import Path

def analizar_archivo_excel(archivo_path):
    """Analiza un archivo Excel y extrae información detallada"""
    try:
        # Leer el archivo Excel
        excel_file = pd.ExcelFile(archivo_path)
        
        print(f"\n{'='*80}")
        print(f"ARCHIVO: {os.path.basename(archivo_path)}")
        print(f"{'='*80}")
        
        # Información básica
        print(f"📁 Ruta completa: {archivo_path}")
        print(f"📊 Número de hojas: {len(excel_file.sheet_names)}")
        print(f"📋 Hojas disponibles: {excel_file.sheet_names}")
        
        # Analizar cada hoja
        for sheet_name in excel_file.sheet_names:
            print(f"\n📄 HOJA: '{sheet_name}'")
            print("-" * 50)
            
            try:
                # Leer la hoja
                df = pd.read_excel(archivo_path, sheet_name=sheet_name)
                
                # Información básica de la hoja
                print(f"   Filas: {len(df)}")
                print(f"   Columnas: {len(df.columns)}")
                print(f"   Columnas: {list(df.columns)}")
                
                # Mostrar primeras filas
                if not df.empty:
                    print(f"\n   📋 Primeras 5 filas:")
                    print(df.head().to_string(index=False))
                    
                    # Información de tipos de datos
                    print(f"\n   🔍 Tipos de datos:")
                    for col in df.columns:
                        non_null_count = df[col].count()
                        print(f"      {col}: {df[col].dtype} (valores no nulos: {non_null_count})")
                    
                    # Valores únicos en columnas importantes
                    print(f"\n   🎯 Análisis de columnas clave:")
                    for col in df.columns:
                        if df[col].dtype == 'object' and df[col].count() > 0:
                            unique_vals = df[col].dropna().unique()
                            if len(unique_vals) <= 10:
                                print(f"      {col}: {list(unique_vals)}")
                            else:
                                print(f"      {col}: {len(unique_vals)} valores únicos")
                
            except Exception as e:
                print(f"   ❌ Error al leer la hoja '{sheet_name}': {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al analizar el archivo: {str(e)}")
        return False

def main():
    # Ruta de la carpeta DocumentosExcel
    documentos_path = Path("DocumentosExcel")
    
    if not documentos_path.exists():
        print("❌ La carpeta DocumentosExcel no existe")
        return
    
    # Buscar archivos Excel
    archivos_excel = list(documentos_path.glob("*.xlsx")) + list(documentos_path.glob("*.xls"))
    
    if not archivos_excel:
        print("❌ No se encontraron archivos Excel en la carpeta")
        return
    
    print(f"🔍 Encontrados {len(archivos_excel)} archivos Excel:")
    for archivo in archivos_excel:
        print(f"   - {archivo.name}")
    
    # Analizar cada archivo
    for archivo in archivos_excel:
        analizar_archivo_excel(str(archivo))
    
    print(f"\n{'='*80}")
    print("✅ ANÁLISIS COMPLETADO")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()

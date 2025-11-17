[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/TcpR1N0p)
# [NOMBRE DEL PROYECTO]
### Nombre y carné de los integrantes: 
Jimena Mendez Morales - 2023113347
Ricardo Arce Aguilar - 2023215990

### Estado del proyecto:

## LOGRADO

### Sistema Web
- Aplicación web funcional desarrollada  
- CRUD completo de productos implementado  
- Interfaz de usuario operativa  
- Filtros por sucursal para estadísticas  

### API
- API RESTful implementada y funcional  
- Endpoints para gestión de productos  
- Comunicación correcta entre todas las capas  

### Base de Datos
**Diseño básico:** Esquema de base de datos implementado  

**Fragmentación:**  
- Fragmentación **horizontal** aplicada en tablas de inventario por sucursal  
- Fragmentación **vertical** implementada para datos sensibles de clientes (corporativo vs sucursales)  

**Replicación:**  
- Replicación local **exitosa** de Limón a Corporativo  
- Mecanismo de sincronización implementado  

**Encriptación:**  
- Contraseñas de usuarios encriptadas usando funciones nativas de SQL Server  

### Infraestructura
- Misma arquitectura del Proyecto 1 mantenida  
- Scripts de bases de datos generados  
- Repositorio GitHub configurado y documentado  


---

## PENDIENTE / NO LOGRADO

### Replicación
- Replicación de San José a Corporativo no implementada  
- Sincronización bidireccional completa entre todas las sucursales  

### Vistas Materializadas
- Vistas materializadas en Corporativo para consolidación de datos  
- Reportes corporativos unificados  

### Concurrencia
- Mecanismos avanzados de control de concurrencia no implementados  
- Manejo de conflictos en replicación simultánea  


---

# Arquitectura de Fragmentación Implementada

## Fragmentación Horizontal
- **Inventario:** Segmentado por la sucursal Limón y San Jose
- **Facturas:** Segmentadas por la sucursar Limón y San Jose

## Fragmentación Vertical
### Tabla **Clientes**
- **Sucursales**   
- **Corporativo**  


---


### Enlace del video:
Recordar que el video debe ser público para ser visto por el profesor

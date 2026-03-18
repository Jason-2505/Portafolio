# 🗄️ Sistema de Gestión de Ventas

Sistema de base de datos desarrollado para la gestión de ventas de una tienda, permitiendo administrar productos, clientes y transacciones comerciales mediante una estructura relacional optimizada.


## 🚀 Descripción

Este proyecto consiste en el diseño e implementación de un sistema de gestión de ventas a nivel de base de datos, donde se integran diferentes componentes como control de inventario, registro de clientes y procesamiento de ventas.

Incluye automatización de procesos mediante triggers y procedimientos almacenados, simulando el funcionamiento de un sistema real en un entorno empresarial.


## 🧩 Funcionalidades

- 📦 Gestión de productos (precio, existencia)
- 👥 Registro de clientes
- 💰 Procesamiento de ventas
- 📋 Detalle de ventas por producto
- 🔄 Actualización automática de inventario
- 🧠 Cálculo automático de subtotales mediante triggers
- ⚙️ Registro de ventas mediante procedimientos almacenados
- 🔐 Gestión de usuarios, roles y permisos


## 🛠️ Tecnologías utilizadas

- Oracle SQL


## 🗃️ Estructura de la base de datos

El sistema está compuesto por las siguientes tablas principales:

- `producto`
- `cliente`
- `venta`
- `detalle_venta`

Estas tablas están relacionadas mediante claves primarias y foráneas, garantizando la integridad de los datos.


## ⚙️ Componentes avanzados

- 🔢 Secuencias para generación automática de IDs
- ⚡ Trigger para cálculo automático de subtotales
- 🧠 Procedimiento almacenado `registrar_venta` para automatizar el proceso de venta
- 🔄 Uso de MERGE para actualización masiva de datos
- 💾 Manejo de transacciones (COMMIT / ROLLBACK)


## 🎯 Objetivo del proyecto

Simular el funcionamiento de un sistema de ventas real a nivel de base de datos, aplicando buenas prácticas en diseño relacional, automatización de procesos y control de transacciones.


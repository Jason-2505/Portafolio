// Datos iniciales y almacenamiento local
let menu = JSON.parse(localStorage.getItem('restaurante_menu')) || [];
let mesas = JSON.parse(localStorage.getItem('restaurante_mesas')) || [];
let facturas = JSON.parse(localStorage.getItem('restaurante_facturas')) || [];
let inventario = JSON.parse(localStorage.getItem('restaurante_inventario')) || [];
let pedidoActual = { mesa: '', platos: [], total: 0 };

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarSelectsPedido();
    renderizarMenu();
    renderizarMesas();
    renderizarFacturas();
    renderizarInventario();
    asignarEventos();
});

// Función para guardar datos en localStorage
function guardarDatos(clave, datos) {
    localStorage.setItem(`restaurante_${clave}`, JSON.stringify(datos));
}

// Función para limpiar campos de formulario
function limpiarCampos(ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

// ---------------------- SECCIÓN MENÚ ----------------------
function agregarPlatoMenu() {
    const nombre = document.getElementById('nombre-plato').value.trim();
    const precio = parseFloat(document.getElementById('precio-plato').value);
    const categoria = document.getElementById('categoria-plato').value;
    const ingredientes = document.getElementById('ingredientes-plato').value.split(',').map(i => i.trim());

    if (!nombre || isNaN(precio) || ingredientes.length === 0) return alert('Completa todos los campos');

    const plato = {
        id: Date.now(),
        nombre,
        precio,
        categoria,
        ingredientes
    };

    menu.push(plato);
    guardarDatos('menu', menu);
    renderizarMenu();
    limpiarCampos(['nombre-plato', 'precio-plato', 'ingredientes-plato']);
}

function renderizarMenu() {
    const lista = document.getElementById('lista-menu');
    lista.innerHTML = '';

    menu.forEach(plato => {
        lista.innerHTML += `
            <div class="col-md-4">
                <div class="plato-card">
                    <h5>${plato.nombre}</h5>
                    <p class="mb-1"><strong>Precio:</strong> $${plato.precio.toFixed(2)}</p>
                    <span class="badge badge-categoria mb-2">${plato.categoria}</span>
                    <p class="mb-1"><strong>Ingredientes:</strong> ${plato.ingredientes.join(', ')}</p>
                    <button class="btn btn-danger btn-sm w-100" onclick="eliminarPlatoMenu(${plato.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
}

function eliminarPlatoMenu(id) {
    menu = menu.filter(p => p.id !== id);
    guardarDatos('menu', menu);
    renderizarMenu();
    cargarSelectsPedido();
}

// ---------------------- SECCIÓN MESAS ----------------------
function agregarMesa() {
    const numero = parseInt(document.getElementById('numero-mesa').value);

    if (isNaN(numero) || numero < 1) return alert('Ingresa un número de mesa válido');
    if (mesas.some(m => m.numero === numero)) return alert('La mesa ya existe');

    const mesa = {
        numero,
        estado: 'libre'
    };

    mesas.push(mesa);
    guardarDatos('mesas', mesas);
    renderizarMesas();
    cargarSelectsPedido();
    limpiarCampos(['numero-mesa']);
}

function renderizarMesas() {
    const lista = document.getElementById('lista-mesas');
    lista.innerHTML = '';

    mesas.forEach(mesa => {
        lista.innerHTML += `
            <div class="col-md-3">
                <div class="mesa-card">
                    <h5>Mesa #${mesa.numero}</h5>
                    <span class="badge ${mesa.estado === 'ocupada' ? 'badge-ocupada' : 'badge-libre'} mb-2">
                        ${mesa.estado.toUpperCase()}
                    </span>
                    <button class="btn btn-outline-primary btn-sm w-100" onclick="cambiarEstadoMesa(${mesa.numero})">
                        <i class="bi bi-arrow-repeat"></i> Cambiar Estado
                    </button>
                </div>
            </div>
        `;
    });
}

function cambiarEstadoMesa(numero) {
    const mesa = mesas.find(m => m.numero === numero);
    mesa.estado = mesa.estado === 'libre' ? 'ocupada' : 'libre';
    guardarDatos('mesas', mesas);
    renderizarMesas();
    cargarSelectsPedido();
}

function actualizarEstadosMesas() {
    mesas.forEach(mesa => {
        const mesaOcupada = facturas.some(f => f.mesa === mesa.numero && f.fecha.split(' ')[0] === new Date().toLocaleDateString());
        mesa.estado = mesaOcupada ? 'ocupada' : 'libre';
    });
    guardarDatos('mesas', mesas);
    renderizarMesas();
}

// ---------------------- SECCIÓN PEDIDOS ----------------------
function cargarSelectsPedido() {
    const mesaSelect = document.getElementById('mesa-pedido');
    const platoSelect = document.getElementById('plato-pedido');
    
    // Limpiar selects
    mesaSelect.innerHTML = '<option value="">Selecciona una mesa</option>';
    platoSelect.innerHTML = '<option value="">Selecciona un plato</option>';

    // Cargar mesas
    mesas.forEach(mesa => {
        mesaSelect.innerHTML += `<option value="${mesa.numero}">Mesa #${mesa.numero} (${mesa.estado})</option>`;
    });

    // Cargar platos
    menu.forEach(plato => {
        platoSelect.innerHTML += `
            <option value="${plato.id}" data-precio="${plato.precio}" data-ingredientes="${plato.ingredientes.join(',')}">
                ${plato.nombre} - $${plato.precio.toFixed(2)}
            </option>
        `;
    });
}

function agregarPlatoPedido() {
    const mesaSeleccionada = document.getElementById('mesa-pedido').value;
    const platoSeleccionado = document.getElementById('plato-pedido');
    const cantidad = parseInt(document.getElementById('cantidad-pedido').value);
    const platoId = parseInt(platoSeleccionado.value);
    const plato = menu.find(p => p.id === platoId);

    if (!mesaSeleccionada || !plato || isNaN(cantidad) || cantidad < 1) return alert('Completa todos los campos correctamente');

    // Actualizar pedido actual
    pedidoActual.mesa = mesaSeleccionada;
    const platoExistente = pedidoActual.platos.find(p => p.id === platoId);

    if (platoExistente) {
        platoExistente.cantidad += cantidad;
    } else {
        pedidoActual.platos.push({
            id: platoId,
            nombre: plato.nombre,
            precioUnitario: plato.precio,
            cantidad,
            ingredientes: plato.ingredientes
        });
    }

    // Actualizar total
    pedidoActual.total = pedidoActual.platos.reduce((sum, p) => sum + (p.precioUnitario * p.cantidad), 0);
    renderizarPedidoActual();
    actualizarStockIngredientes(plato.ingredientes, cantidad);
}

function renderizarPedidoActual() {
    const lista = document.getElementById('lista-pedido');
    const totalElement = document.getElementById('total-pedido');

    lista.innerHTML = pedidoActual.platos.length === 0 
        ? '<p class="text-muted">No hay platos agregados al pedido</p>'
        : `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Plato</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${pedidoActual.platos.map(p => `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>$${p.precioUnitario.toFixed(2)}</td>
                            <td>${p.cantidad}</td>
                            <td>$${(p.precioUnitario * p.cantidad).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    totalElement.textContent = pedidoActual.total.toFixed(2);
}

function finalizarPedido() {
    if (pedidoActual.platos.length === 0 || !pedidoActual.mesa) return alert('El pedido está vacío o no se seleccionó una mesa');

    const cliente = document.getElementById('cliente-factura').value.trim() || 'Cliente no registrado';
    const factura = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        mesa: parseInt(pedidoActual.mesa),
        cliente,
        total: pedidoActual.total,
        platos: pedidoActual.platos
    };

    // Guardar factura y actualizar estado de mesa
    facturas.push(factura);
    guardarDatos('facturas', facturas);
    mesas.find(m => m.numero === factura.mesa).estado = 'ocupada';
    guardarDatos('mesas', mesas);

    // Reiniciar pedido actual
    pedidoActual = { mesa: '', platos: [], total: 0 };
    renderizarPedidoActual();
    renderizarFacturas();
    renderizarMesas();
    alert('Pedido finalizado y factura generada exitosamente');
}

// ---------------------- SECCIÓN FACTURACIÓN ----------------------
function buscarFactura() {
    const clienteBusqueda = document.getElementById('cliente-factura').value.trim().toLowerCase();
    const facturasFiltradas = clienteBusqueda === '' 
        ? facturas 
        : facturas.filter(f => f.cliente.toLowerCase().includes(clienteBusqueda));

    renderizarFacturas(facturasFiltradas);
}

function renderizarFacturas(facturasMostrar = facturas) {
    const lista = document.getElementById('lista-facturas');
    lista.innerHTML = facturasMostrar.length === 0 
        ? '<tr><td colspan="5" class="text-muted text-center">No hay facturas registradas</td></tr>'
        : facturasMostrar.map(f => `
            <tr>
                <td>${f.id}</td>
                <td>${f.fecha}</td>
                <td>#${f.mesa}</td>
                <td>${f.cliente}</td>
                <td>$${f.total.toFixed(2)}</td>
            </tr>
        `).join('');
}

// ---------------------- SECCIÓN INVENTARIO ----------------------
function agregarIngrediente() {
    const nombre = document.getElementById('nombre-ingrediente').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad-ingrediente').value);

    if (!nombre || isNaN(cantidad) || cantidad < 0) return alert('Completa todos los campos correctamente');

    const ingredienteExistente = inventario.find(i => i.nombre.toLowerCase() === nombre.toLowerCase());

    if (ingredienteExistente) {
        ingredienteExistente.cantidad += cantidad;
    } else {
        inventario.push({ nombre, cantidad });
    }

    guardarDatos('inventario', inventario);
    renderizarInventario();
    limpiarCampos(['nombre-ingrediente', 'cantidad-ingrediente']);
}

function renderizarInventario() {
    const lista = document.getElementById('lista-inventario');
    lista.innerHTML = inventario.length === 0 
        ? '<tr><td colspan="4" class="text-muted text-center">No hay ingredientes en el inventario</td></tr>'
        : inventario.map(i => `
            <tr>
                <td>${i.nombre}</td>
                <td>${i.cantidad}</td>
                <td><span class="badge ${i.cantidad < 5 ? 'badge-stock-bajo' : 'badge-stock-normal'}">
                    ${i.cantidad < 5 ? 'Stock Bajo' : 'Stock Normal'}
                </span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarIngrediente('${i.nombre}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
}

function editarIngrediente(nombre) {
    const nuevaCantidad = parseInt(prompt(`Ingresa la nueva cantidad para ${nombre}:`));
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) return alert('Cantidad inválida');

    const ingrediente = inventario.find(i => i.nombre === nombre);
    ingrediente.cantidad = nuevaCantidad;
    guardarDatos('inventario', inventario);
    renderizarInventario();
}

function actualizarStockIngredientes(ingredientes, cantidad) {
    ingredientes.forEach(ing => {
        const ingrediente = inventario.find(i => i.nombre.toLowerCase() === ing.toLowerCase());
        if (ingrediente) ingrediente.cantidad -= cantidad;
    });
    guardarDatos('inventario', inventario);
    renderizarInventario();
}

// ---------------------- ASIGNACIÓN DE EVENTOS ----------------------
function asignarEventos() {
    // Menú
    document.getElementById('btn-agregar-plato-menu').addEventListener('click', agregarPlatoMenu);
    
    // Mesas
    document.getElementById('btn-agregar-mesa').addEventListener('click', agregarMesa);
    document.getElementById('btn-actualizar-mesas').addEventListener('click', actualizarEstadosMesas);
    
    // Pedidos
    document.getElementById('btn-agregar-plato').addEventListener('click', agregarPlatoPedido);
    document.getElementById('btn-finalizar-pedido').addEventListener('click', finalizarPedido);
    
    // Facturación
    document.getElementById('btn-buscar-factura').addEventListener('click', buscarFactura);
    
    // Inventario
    document.getElementById('btn-agregar-ingrediente').addEventListener('click', agregarIngrediente);
}

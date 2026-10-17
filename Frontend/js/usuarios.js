/**
 * usuarios.js — Lógica del módulo de Gestión de Usuarios
 * Inventarios Mahoraga · Frontend
 *
 * Requerimientos cubiertos:
 *  1. Crear usuarios e invitarlos al sistema
 *  2. Editar datos y asignar roles
 *  3. Activar, desactivar o suspender cuentas
 *  4. Cambiar contraseñas y revocar sesiones
 *  5. Consultar el historial de actividad
 *  6. Evitar que alguien se asigne privilegios superiores
 */

(function () {
  'use strict';

  // =====================================================================
  //  CONFIGURACIÓN: JERARQUÍA DE ROLES (mayor número = mayor privilegio)
  //  Regla de negocio: un usuario NO puede asignar un rol superior al suyo.
  // =====================================================================
  var ROLE_HIERARCHY = {
    'Auditor':       1,
    'Operador':      2,
    'Administrador': 3,
    'SuperAdmin':    4
  };

  // El usuario actualmente autenticado (mock, simulando sesión)
  var CURRENT_USER = {
    id: 1,
    nombre: 'Carlos Ruiz',
    email: 'carlos.ruiz@mahoraga.com',
    rol: 'Administrador' // Puede cambiar para probar restricciones de privilegio
  };

  // =====================================================================
  //  DATOS MOCK — USUARIOS
  // =====================================================================
  var users = [
    {
      id: 1,
      nombre: 'Carlos Ruiz',
      email: 'carlos.ruiz@mahoraga.com',
      rol: 'Administrador',
      estado: 'Activo',
      ultimoAcceso: '2026-10-15 20:30',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    {
      id: 2,
      nombre: 'María López',
      email: 'maria.lopez@mahoraga.com',
      rol: 'Operador',
      estado: 'Activo',
      ultimoAcceso: '2026-10-15 18:12',
      avatarUrl: ''
    },
    {
      id: 3,
      nombre: 'Ignacio Sánchez',
      email: 'ignacio@mahoraga.com',
      rol: 'SuperAdmin',
      estado: 'Activo',
      ultimoAcceso: '2026-10-15 21:00',
      avatarUrl: ''
    },
    {
      id: 4,
      nombre: 'Ana Fernández',
      email: 'ana.fernandez@mahoraga.com',
      rol: 'Auditor',
      estado: 'Activo',
      ultimoAcceso: '2026-10-14 09:45',
      avatarUrl: ''
    },
    {
      id: 5,
      nombre: 'Julio Mendoza',
      email: 'julio@mahoraga.com',
      rol: 'Operador',
      estado: 'Suspendido',
      ultimoAcceso: '2026-10-10 14:22',
      avatarUrl: ''
    },
    {
      id: 6,
      nombre: 'Julia Hernández',
      email: 'julia.hernandez@mahoraga.com',
      rol: 'Operador',
      estado: 'Inactivo',
      ultimoAcceso: '2026-09-28 11:05',
      avatarUrl: ''
    }
  ];

  // =====================================================================
  //  DATOS MOCK — HISTORIAL DE ACTIVIDAD
  // =====================================================================
  var activityLog = [
    { type: 'login',    text: '<strong>Carlos Ruiz</strong> inició sesión desde 192.168.1.45',                      time: '2026-10-15 20:30' },
    { type: 'create',   text: '<strong>Carlos Ruiz</strong> invitó al usuario <strong>Julia Hernández</strong>',    time: '2026-10-15 19:50' },
    { type: 'role',     text: '<strong>Ignacio Sánchez</strong> cambió el rol de <strong>María López</strong> a Operador', time: '2026-10-15 17:30' },
    { type: 'status',   text: '<strong>Carlos Ruiz</strong> suspendió la cuenta de <strong>Julio Mendoza</strong>',   time: '2026-10-14 16:10' },
    { type: 'password', text: '<strong>Ana Fernández</strong> cambió su contraseña',                                 time: '2026-10-14 09:50' },
    { type: 'session',  text: '<strong>Ignacio Sánchez</strong> revocó las sesiones de <strong>Julio Mendoza</strong>',     time: '2026-10-13 15:20' },
    { type: 'login',    text: '<strong>María López</strong> inició sesión desde 10.0.0.12',                          time: '2026-10-13 08:00' },
    { type: 'create',   text: '<strong>Ignacio Sánchez</strong> invitó al usuario <strong>Julio Mendoza</strong>',          time: '2026-10-10 10:00' },
    { type: 'status',   text: '<strong>Ignacio Sánchez</strong> activó la cuenta de <strong>Ana Fernández</strong>',      time: '2026-10-09 14:30' },
    { type: 'role',     text: '<strong>Ignacio Sánchez</strong> asignó el rol <strong>Auditor</strong> a <strong>Ana Fernández</strong>', time: '2026-10-09 14:28' }
  ];

  var nextUserId = 7;

  // =====================================================================
  //  REFERENCIAS AL DOM
  // =====================================================================
  var tbody            = document.getElementById('usersTableBody');
  var usersEmpty       = document.getElementById('usersEmpty');
  var activityList     = document.getElementById('activityList');
  var activityEmpty    = document.getElementById('activityEmpty');
  var filterInput      = document.getElementById('filterUsers');
  var filterActivity   = document.getElementById('filterActivity');
  var tabUsers         = document.getElementById('tabUsers');
  var tabActivity      = document.getElementById('tabActivity');
  var mainTabs         = document.getElementById('mainTabs');

  // Stats
  var statTotal        = document.getElementById('statTotal');
  var statActive       = document.getElementById('statActive');
  var statSuspended    = document.getElementById('statSuspended');
  var statInactive     = document.getElementById('statInactive');

  // Modal: Crear / Editar usuario
  var modalUser        = document.getElementById('modalUser');
  var closeModalUser   = document.getElementById('closeModalUser');
  var cancelModalUser  = document.getElementById('cancelModalUser');
  var formUser         = document.getElementById('formUser');
  var editUserId       = document.getElementById('editUserId');
  var inputNombre      = document.getElementById('inputNombre');
  var inputEmail       = document.getElementById('inputEmail');
  var inputRol         = document.getElementById('inputRol');
  var inputEstado      = document.getElementById('inputEstado');
  var modalUserTitle   = document.getElementById('modalUserTitle');
  var modalUserDesc    = document.getElementById('modalUserDesc');
  var submitUserLabel  = document.getElementById('submitUserLabel');
  var btnInviteUser    = document.getElementById('btnInviteUser');

  // Modal: Cambiar contraseña
  var modalPassword       = document.getElementById('modalPassword');
  var closeModalPassword  = document.getElementById('closeModalPassword');
  var cancelModalPassword = document.getElementById('cancelModalPassword');
  var formPassword        = document.getElementById('formPassword');
  var passwordUserId      = document.getElementById('passwordUserId');
  var inputNewPw          = document.getElementById('inputNewPw');
  var inputConfirmPw      = document.getElementById('inputConfirmPw');
  var modalPasswordDesc   = document.getElementById('modalPasswordDesc');

  // Modal: Confirmación
  var modalConfirm        = document.getElementById('modalConfirm');
  var closeModalConfirm   = document.getElementById('closeModalConfirm');
  var cancelModalConfirm  = document.getElementById('cancelModalConfirm');
  var confirmActionBtn    = document.getElementById('confirmActionBtn');
  var confirmIcon         = document.getElementById('confirmIcon');
  var confirmTitle        = document.getElementById('confirmTitle');
  var confirmDesc         = document.getElementById('confirmDesc');

  // Toast
  var toast            = document.getElementById('usrToast');
  var toastMessage     = document.getElementById('usrToastMessage');
  var toastClose       = document.getElementById('usrToastClose');

  // =====================================================================
  //  UTILIDADES
  // =====================================================================

  function getInitials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(message, type) {
    toast.classList.remove('usr-toast--success', 'usr-toast--error', 'usr-toast--warning', 'usr-toast--visible');
    toastMessage.textContent = message;
    toast.classList.add('usr-toast--' + type);
    void toast.offsetWidth;
    toast.classList.add('usr-toast--visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.classList.remove('usr-toast--visible'); }, 4000);
  }

  function hideToast() {
    toast.classList.remove('usr-toast--visible');
    clearTimeout(toast._timer);
  }

  function openModal(overlay) {
    overlay.classList.add('usr-modal-overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('usr-modal-overlay--visible');
    document.body.style.overflow = '';
  }

  /** Obtiene el nivel máximo de rol que el usuario actual puede asignar */
  function getMaxAssignableLevel() {
    return ROLE_HIERARCHY[CURRENT_USER.rol] || 0;
  }

  /** Aplica la restricción de privilegios al selector de roles */
  function applyRoleRestrictions() {
    var maxLevel = getMaxAssignableLevel();
    var options = inputRol.querySelectorAll('option');
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      if (opt.value && ROLE_HIERARCHY[opt.value]) {
        // Deshabilita roles con nivel mayor o igual al del usuario actual
        // (un admin NO puede crear otro admin ni SuperAdmin)
        opt.disabled = ROLE_HIERARCHY[opt.value] >= maxLevel;
      }
    }
  }

  // =====================================================================
  //  RENDERIZADO DE TABLA DE USUARIOS
  // =====================================================================
  function renderUsers(filter) {
    filter = (filter || '').toLowerCase();
    var filtered = users.filter(function (u) {
      return u.nombre.toLowerCase().indexOf(filter) !== -1 ||
             u.email.toLowerCase().indexOf(filter) !== -1;
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      usersEmpty.style.display = 'block';
      return;
    }
    usersEmpty.style.display = 'none';

    filtered.forEach(function (u) {
      var tr = document.createElement('tr');

      // Avatar o iniciales
      var avatarHtml;
      if (u.avatarUrl) {
        avatarHtml = '<img src="' + escapeHtml(u.avatarUrl) + '" alt="' + escapeHtml(u.nombre) + '" class="usr-avatar" onerror="this.outerHTML=\'<span class=usr-avatar-placeholder>' + getInitials(u.nombre) + '</span>\'">';
      } else {
        avatarHtml = '<span class="usr-avatar-placeholder">' + getInitials(u.nombre) + '</span>';
      }

      // Badge de estado
      var estadoClass = u.estado === 'Activo' ? 'activo' : u.estado === 'Suspendido' ? 'suspendido' : 'inactivo';

      // Badge de rol
      var rolClass = u.rol === 'SuperAdmin' ? 'superadmin' : u.rol === 'Administrador' ? 'admin' : u.rol === 'Auditor' ? 'auditor' : 'operador';

      // Determinar si el usuario actual puede administrar este usuario
      var canManage = ROLE_HIERARCHY[CURRENT_USER.rol] > ROLE_HIERARCHY[u.rol];
      var isSelf = u.id === CURRENT_USER.id;

      tr.innerHTML =
        '<td>' +
          '<div class="usr-identity">' +
            avatarHtml +
            '<div class="usr-identity-text">' +
              '<span class="usr-identity-name">' + escapeHtml(u.nombre) + '</span>' +
              '<span class="usr-identity-email">' + escapeHtml(u.email) + '</span>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><span class="usr-role-badge usr-role-badge--' + rolClass + '">' + escapeHtml(u.rol) + '</span></td>' +
        '<td>' +
          '<span class="usr-badge usr-badge--' + estadoClass + '">' +
            '<span class="usr-badge-dot"></span>' +
            escapeHtml(u.estado) +
          '</span>' +
        '</td>' +
        '<td style="font-size:13px;color:#64748b;">' + escapeHtml(u.ultimoAcceso) + '</td>' +
        '<td>' +
          '<div class="usr-row-actions">' +
            '<button type="button" class="usr-action-btn" title="Editar" data-action="edit" data-id="' + u.id + '"' + (!canManage && !isSelf ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
            '</button>' +
            '<button type="button" class="usr-action-btn" title="Cambiar contraseña" data-action="password" data-id="' + u.id + '"' + (!canManage && !isSelf ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '</button>' +
            '<button type="button" class="usr-action-btn usr-action-btn--warning" title="Revocar sesiones" data-action="revoke" data-id="' + u.id + '"' + (!canManage ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
            '</button>' +
            (u.estado === 'Suspendido' ?
              '<button type="button" class="usr-action-btn" title="Reactivar" data-action="activate" data-id="' + u.id + '"' + (!canManage ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
              '</button>'
            :
              '<button type="button" class="usr-action-btn usr-action-btn--danger" title="Suspender" data-action="suspend" data-id="' + u.id + '"' + (!canManage ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '</button>'
            ) +
          '</div>' +
        '</td>';

      tbody.appendChild(tr);
    });
  }

  // =====================================================================
  //  RENDERIZADO DEL HISTORIAL DE ACTIVIDAD
  // =====================================================================
  function renderActivity(filter) {
    filter = (filter || '').toLowerCase();
    var filtered = activityLog.filter(function (a) {
      return a.text.toLowerCase().indexOf(filter) !== -1;
    });

    activityList.innerHTML = '';

    if (filtered.length === 0) {
      activityEmpty.style.display = 'block';
      return;
    }
    activityEmpty.style.display = 'none';

    // Iconos por tipo de actividad
    var iconMap = {
      login:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
      create:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
      role:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      status:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      password: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      session:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    };

    filtered.forEach(function (a) {
      var li = document.createElement('li');
      li.className = 'usr-activity-item';
      li.innerHTML =
        '<div class="usr-activity-icon usr-activity-icon--' + a.type + '">' +
          (iconMap[a.type] || '') +
        '</div>' +
        '<div class="usr-activity-body">' +
          '<p class="usr-activity-text">' + a.text + '</p>' +
          '<p class="usr-activity-time">' + escapeHtml(a.time) + '</p>' +
        '</div>';
      activityList.appendChild(li);
    });
  }

  // =====================================================================
  //  ACTUALIZAR ESTADÍSTICAS
  // =====================================================================
  function updateStats() {
    var total = users.length;
    var active = users.filter(function (u) { return u.estado === 'Activo'; }).length;
    var suspended = users.filter(function (u) { return u.estado === 'Suspendido'; }).length;
    var inactive = users.filter(function (u) { return u.estado === 'Inactivo'; }).length;

    statTotal.textContent = total;
    statActive.textContent = active;
    statSuspended.textContent = suspended;
    statInactive.textContent = inactive;
  }

  // =====================================================================
  //  AGREGAR ENTRADA AL HISTORIAL
  // =====================================================================
  function addActivity(type, text) {
    var now = new Date();
    var ts = now.getFullYear() + '-' +
             String(now.getMonth() + 1).padStart(2, '0') + '-' +
             String(now.getDate()).padStart(2, '0') + ' ' +
             String(now.getHours()).padStart(2, '0') + ':' +
             String(now.getMinutes()).padStart(2, '0');
    activityLog.unshift({ type: type, text: text, time: ts });
  }

  // =====================================================================
  //  TABS
  // =====================================================================
  mainTabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.usr-tab');
    if (!btn) return;

    mainTabs.querySelectorAll('.usr-tab').forEach(function (t) { t.classList.remove('usr-tab--active'); });
    btn.classList.add('usr-tab--active');

    var tab = btn.getAttribute('data-tab');
    if (tab === 'users') {
      tabUsers.style.display = '';
      tabActivity.style.display = 'none';
    } else {
      tabUsers.style.display = 'none';
      tabActivity.style.display = '';
      renderActivity(filterActivity.value);
    }
  });

  // =====================================================================
  //  FILTROS
  // =====================================================================
  filterInput.addEventListener('input', function () {
    renderUsers(filterInput.value);
  });

  filterActivity.addEventListener('input', function () {
    renderActivity(filterActivity.value);
  });

  // =====================================================================
  //  MODAL: CREAR / EDITAR USUARIO
  // =====================================================================
  function openUserModal(userId) {
    // Limpiar errores previos
    ['fieldNombre', 'fieldEmailUser', 'fieldRol', 'fieldEstado'].forEach(function (id) {
      document.getElementById(id).classList.remove('usr-modal-field--error');
    });

    applyRoleRestrictions();

    if (userId) {
      // Modo edición
      var user = users.find(function (u) { return u.id === userId; });
      if (!user) return;

      editUserId.value = user.id;
      inputNombre.value = user.nombre;
      inputEmail.value = user.email;
      inputRol.value = user.rol;
      inputEstado.value = user.estado;
      modalUserTitle.textContent = 'Editar usuario';
      modalUserDesc.textContent = 'Modifica los datos y el rol del usuario.';
      submitUserLabel.textContent = 'Guardar cambios';
    } else {
      // Modo creación
      editUserId.value = '';
      formUser.reset();
      inputEstado.value = 'Activo';
      modalUserTitle.textContent = 'Invitar nuevo usuario';
      modalUserDesc.textContent = 'Completa los datos para crear la cuenta e invitar al usuario al sistema.';
      submitUserLabel.textContent = 'Invitar usuario';
    }

    openModal(modalUser);
    inputNombre.focus();
  }

  btnInviteUser.addEventListener('click', function () { openUserModal(null); });
  closeModalUser.addEventListener('click', function () { closeModal(modalUser); });
  cancelModalUser.addEventListener('click', function () { closeModal(modalUser); });

  formUser.addEventListener('submit', function (e) {
    e.preventDefault();

    var hasErrors = false;
    var nombre = inputNombre.value.trim();
    var email = inputEmail.value.trim();
    var rol = inputRol.value;

    // Validaciones
    if (!nombre) {
      document.getElementById('fieldNombre').classList.add('usr-modal-field--error');
      hasErrors = true;
    } else {
      document.getElementById('fieldNombre').classList.remove('usr-modal-field--error');
    }

    if (!email || !isValidEmail(email)) {
      document.getElementById('fieldEmailUser').classList.add('usr-modal-field--error');
      hasErrors = true;
    } else {
      document.getElementById('fieldEmailUser').classList.remove('usr-modal-field--error');
    }

    if (!rol) {
      document.getElementById('fieldRol').classList.add('usr-modal-field--error');
      hasErrors = true;
    } else {
      document.getElementById('fieldRol').classList.remove('usr-modal-field--error');
    }

    if (hasErrors) return;

    // Verificar restricción de privilegio
    if (ROLE_HIERARCHY[rol] >= getMaxAssignableLevel()) {
      showToast('No puedes asignar un rol igual o superior al tuyo (' + CURRENT_USER.rol + ').', 'error');
      return;
    }

    var estado = inputEstado.value;
    var id = editUserId.value ? parseInt(editUserId.value) : null;

    if (id) {
      // Editar existente
      var user = users.find(function (u) { return u.id === id; });
      if (user) {
        var oldRol = user.rol;
        user.nombre = nombre;
        user.email = email;
        user.rol = rol;
        user.estado = estado;

        if (oldRol !== rol) {
          addActivity('role', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> cambió el rol de <strong>' + escapeHtml(nombre) + '</strong> de ' + escapeHtml(oldRol) + ' a <strong>' + escapeHtml(rol) + '</strong>');
        }

        showToast('Usuario "' + nombre + '" actualizado correctamente.', 'success');
      }
    } else {
      // Crear nuevo
      var newUser = {
        id: nextUserId++,
        nombre: nombre,
        email: email,
        rol: rol,
        estado: estado,
        ultimoAcceso: 'Nunca',
        avatarUrl: ''
      };
      users.push(newUser);
      addActivity('create', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> invitó al usuario <strong>' + escapeHtml(nombre) + '</strong> con rol ' + escapeHtml(rol));
      showToast('Invitación enviada a "' + nombre + '" (' + email + ').', 'success');
    }

    closeModal(modalUser);
    renderUsers(filterInput.value);
    updateStats();
  });

  // =====================================================================
  //  MODAL: CAMBIAR CONTRASEÑA
  // =====================================================================
  function openPasswordModal(userId) {
    var user = users.find(function (u) { return u.id === userId; });
    if (!user) return;

    passwordUserId.value = userId;
    modalPasswordDesc.textContent = 'Asigna una nueva contraseña para ' + user.nombre + '.';
    formPassword.reset();
    ['fieldNewPw', 'fieldConfirmPw'].forEach(function (id) {
      document.getElementById(id).classList.remove('usr-modal-field--error');
    });

    openModal(modalPassword);
    inputNewPw.focus();
  }

  closeModalPassword.addEventListener('click', function () { closeModal(modalPassword); });
  cancelModalPassword.addEventListener('click', function () { closeModal(modalPassword); });

  formPassword.addEventListener('submit', function (e) {
    e.preventDefault();

    var pw = inputNewPw.value;
    var confirm = inputConfirmPw.value;
    var hasErrors = false;

    if (!pw || pw.length < 6) {
      document.getElementById('fieldNewPw').classList.add('usr-modal-field--error');
      hasErrors = true;
    } else {
      document.getElementById('fieldNewPw').classList.remove('usr-modal-field--error');
    }

    if (pw !== confirm) {
      document.getElementById('fieldConfirmPw').classList.add('usr-modal-field--error');
      hasErrors = true;
    } else {
      document.getElementById('fieldConfirmPw').classList.remove('usr-modal-field--error');
    }

    if (hasErrors) return;

    var userId = parseInt(passwordUserId.value);
    var user = users.find(function (u) { return u.id === userId; });
    if (user) {
      addActivity('password', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> cambió la contraseña de <strong>' + escapeHtml(user.nombre) + '</strong>');
      showToast('Contraseña de "' + user.nombre + '" actualizada correctamente.', 'success');
    }

    closeModal(modalPassword);
  });

  // =====================================================================
  //  MODAL: CONFIRMACIÓN GENÉRICA (Suspender / Reactivar / Revocar)
  // =====================================================================
  var pendingConfirmAction = null;

  function openConfirm(config) {
    confirmIcon.className = 'usr-confirm-icon ' + (config.iconClass || 'usr-confirm-icon--warning');
    confirmTitle.textContent = config.title || '¿Estás seguro?';
    confirmDesc.textContent = config.desc || '';
    confirmActionBtn.className = 'usr-btn ' + (config.btnClass || 'usr-btn--danger');
    confirmActionBtn.textContent = config.btnText || 'Confirmar';
    pendingConfirmAction = config.onConfirm;
    openModal(modalConfirm);
  }

  closeModalConfirm.addEventListener('click', function () { closeModal(modalConfirm); pendingConfirmAction = null; });
  cancelModalConfirm.addEventListener('click', function () { closeModal(modalConfirm); pendingConfirmAction = null; });

  confirmActionBtn.addEventListener('click', function () {
    if (typeof pendingConfirmAction === 'function') {
      pendingConfirmAction();
    }
    closeModal(modalConfirm);
    pendingConfirmAction = null;
  });

  // =====================================================================
  //  ACCIONES DE FILA (delegación de eventos en la tabla)
  // =====================================================================
  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('.usr-action-btn');
    if (!btn || btn.disabled) return;

    var action = btn.getAttribute('data-action');
    var userId = parseInt(btn.getAttribute('data-id'));
    var user   = users.find(function (u) { return u.id === userId; });
    if (!user) return;

    switch (action) {
      case 'edit':
        openUserModal(userId);
        break;

      case 'password':
        openPasswordModal(userId);
        break;

      case 'revoke':
        openConfirm({
          title: '¿Revocar sesiones activas?',
          desc: 'Se cerrarán todas las sesiones activas de ' + user.nombre + '. Deberá iniciar sesión nuevamente.',
          iconClass: 'usr-confirm-icon--warning',
          btnClass: 'usr-btn--danger',
          btnText: 'Revocar sesiones',
          onConfirm: function () {
            addActivity('session', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> revocó todas las sesiones de <strong>' + escapeHtml(user.nombre) + '</strong>');
            showToast('Sesiones de "' + user.nombre + '" revocadas.', 'warning');
          }
        });
        break;

      case 'suspend':
        openConfirm({
          title: '¿Suspender esta cuenta?',
          desc: user.nombre + ' no podrá acceder al sistema hasta que se reactive su cuenta.',
          iconClass: 'usr-confirm-icon--danger',
          btnClass: 'usr-btn--danger',
          btnText: 'Suspender cuenta',
          onConfirm: function () {
            user.estado = 'Suspendido';
            addActivity('status', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> suspendió la cuenta de <strong>' + escapeHtml(user.nombre) + '</strong>');
            showToast('Cuenta de "' + user.nombre + '" suspendida.', 'warning');
            renderUsers(filterInput.value);
            updateStats();
          }
        });
        break;

      case 'activate':
        openConfirm({
          title: '¿Reactivar esta cuenta?',
          desc: user.nombre + ' podrá volver a acceder al sistema con sus credenciales actuales.',
          iconClass: 'usr-confirm-icon--warning',
          btnClass: 'usr-btn--primary',
          btnText: 'Reactivar cuenta',
          onConfirm: function () {
            user.estado = 'Activo';
            addActivity('status', '<strong>' + escapeHtml(CURRENT_USER.nombre) + '</strong> reactivó la cuenta de <strong>' + escapeHtml(user.nombre) + '</strong>');
            showToast('Cuenta de "' + user.nombre + '" reactivada.', 'success');
            renderUsers(filterInput.value);
            updateStats();
          }
        });
        break;
    }
  });

  // =====================================================================
  //  CERRAR MODALES CON ESCAPE / CLICK FUERA
  // =====================================================================
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    [modalUser, modalPassword, modalConfirm].forEach(function (m) {
      if (m.classList.contains('usr-modal-overlay--visible')) {
        closeModal(m);
      }
    });
    pendingConfirmAction = null;
  });

  [modalUser, modalPassword, modalConfirm].forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal(overlay);
        pendingConfirmAction = null;
      }
    });
  });

  // =====================================================================
  //  TOAST: CIERRE MANUAL
  // =====================================================================
  toastClose.addEventListener('click', hideToast);

  // =====================================================================
  //  INICIALIZACIÓN
  // =====================================================================
  renderUsers('');
  updateStats();

})();

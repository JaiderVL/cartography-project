export const navbarData = [
    {
        routeLink: 'main',
        icon: 'bi bi-house-door-fill',
        label: 'Inicio',
        roles: ['usuario-invitado', 'usuario-regular', 'moderador', 'administrador']
    },
    {
        routeLink: 'map',
        icon: 'bi bi-map-fill',
        label: 'Mapas',
        roles: ['usuario-regular', 'moderador', 'administrador']
    },
    {
        routeLink: 'activities',
        icon: 'bi bi-calendar-event-fill',
        label: 'Actividades',
        roles: ['moderador', 'administrador']
    },
    {
        routeLink: 'saved-places',
        icon: 'bi bi-bookmark-fill',
        label: 'Lugares Guardados',
        roles: ['usuario-regular', 'moderador', 'administrador']
    },
    {
        routeLink: 'admin-page',
        icon: 'bi bi-people-fill',
        label: 'Usuarios',
        roles: ['administrador']
    },

];
# Sistema Multi-Usuario - Inventario de Cocina

## Usuarios Creados

Cada usuario tiene acceso individual a sus propios ingredientes y recetas.

### Lista de Usuarios:

1. **Irvin** - Password: `irvin123`
2. **Aarón** - Password: `aaron123`
3. **Alejandra** - Password: `ale123`
4. **Pablo** - Password: `pablo123`
5. **Erick** - Password: `erick123`
6. **Edward** - Password: `edward123`
7. **Juan Alberto** - Password: `juanalb123`
8. **Ignacio** - Password: `nacho123`
9. **Santiago** - Password: `santi123`
10. **Mateo** - Password: `mateo123`
11. **Jean Paul** - Password: `jean123`
12. **Juan de Jesús** - Password: `juanjes123`
13. **Ashley** - Password: `ashley123`
14. **Ángel** - Password: `angel123`
15. **Krystal** - Password: `krystal123`
16. **Romina** - Password: `romina123`
17. **Raúl** - Password: `raul123`
18. **Brianda** - Password: `brianda123`
19. **Maestra Gloriela** - Password: `gloriela123`
20. **Maestra Carito** - Password: `carito123`

## Inicializar Base de Datos

Para limpiar la base de datos y crear los usuarios, ejecuta:

```bash
cd backend
node init-db.js
```

Este script:
- ✅ Elimina todos los ingredientes existentes
- ✅ Elimina todas las recetas existentes
- ✅ Elimina todos los usuarios existentes
- ✅ Crea los 20 usuarios nuevos

## Funcionalidad Multi-Usuario

- Cada usuario solo ve sus propios ingredientes
- Cada usuario solo ve sus propias recetas
- Los datos están completamente separados por usuario
- Al cerrar sesión, se redirige al login
- Sistema de autenticación simple pero funcional

## URL de Acceso

- **Login**: https://glodelmar.github.io/inventario-cocina/login.html
- **App Principal**: https://glodelmar.github.io/inventario-cocina/ (requiere login)

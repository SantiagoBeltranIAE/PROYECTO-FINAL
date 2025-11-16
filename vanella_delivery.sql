-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-11-2025 a las 02:34:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vanella_delivery`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carga`
--

CREATE TABLE `carga` (
  `id_carga` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `fecha_carga` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id_compra` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `fecha_compra` datetime DEFAULT current_timestamp(),
  `metodo_pago` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_calendario`
--

CREATE TABLE `eventos_calendario` (
  `id_evento` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `color` varchar(7) DEFAULT '#f59e0b',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eventos_calendario`
--

INSERT INTO `eventos_calendario` (`id_evento`, `titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `color`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Noche de Jazz', 'Música en vivo todos los viernes', '2025-11-15', NULL, '#f59e0b', 1, '2025-11-15 22:01:51', '2025-11-15 22:01:51'),
(2, 'Promoción 2x1 en hamburguesas', 'Válido de lunes a miércoles', '2025-11-20', '2025-11-22', '#22c55e', 1, '2025-11-15 22:01:51', '2025-11-15 22:01:51'),
(3, 'Cata de vinos', 'Selección especial de vinos uruguayyos', '2025-11-25', '2025-11-27', '#8b5cf6', 1, '2025-11-15 22:01:51', '2025-11-15 22:27:23'),
(4, '3x1', 'Hamburguesas especiales', '2025-11-13', '0000-00-00', '#04f655', 1, '2025-11-15 22:15:09', '2025-11-15 22:15:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `meta`
--

CREATE TABLE `meta` (
  `name` varchar(64) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meta`
--

INSERT INTO `meta` (`name`, `value`) VALUES
('pedidos_version', '2025-10-22 14:03:04'),
('productos_version', '2025-10-21 00:02:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `opiniones`
--

CREATE TABLE `opiniones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `opinion` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `puntuacion` int(11) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `opiniones`
--

INSERT INTO `opiniones` (`id`, `nombre`, `opinion`, `fecha`, `puntuacion`) VALUES
(12, 'Pan', 'rico', '2025-10-15 00:07:58', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `cliente_nombre` varchar(120) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `metodo_pago` varchar(30) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(30) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `fecha_hora`, `cliente_nombre`, `telefono`, `direccion`, `referencia`, `metodo_pago`, `total`, `estado`) VALUES
(27, '2025-11-15 21:35:45', 'dasda', '2213123123', 'asdasda', 'dasda', '', 750.00, 'aceptado'),
(28, '2025-11-15 21:50:05', 'dasd', '213123213', 'dsadas', 'dada', '', 2020.00, 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalle`
--

CREATE TABLE `pedido_detalle` (
  `id` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `producto_nombre` varchar(200) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_detalle`
--

INSERT INTO `pedido_detalle` (`id`, `id_pedido`, `producto_nombre`, `cantidad`, `precio_unitario`) VALUES
(1, 14, 'Burger Mestiza', 1, 0.00),
(16, 13, 'Burger Mestiza', 1, 0.00),
(17, 13, 'Cheeseburger Dani', 1, 0.00),
(18, 24, 'Burger Mestiza', 1, 0.00),
(19, 24, 'Vegetariana (Burger)', 1, 300.00),
(20, 25, 'Cheeseburger Kids', 1, 300.00),
(21, 25, 'Vegetariana (Burger)', 1, 300.00),
(22, 26, 'Cheeseburger Kids', 1, 300.00),
(23, 26, 'Vegetariana (Burger)', 1, 300.00),
(24, 27, 'Cheeseburger Dani', 1, 350.00),
(25, 27, 'Cheeseburger Javito', 1, 400.00),
(26, 28, 'Cheeseburger Kids', 1, 300.00),
(27, 28, 'Cheeseburger Javito', 1, 400.00),
(28, 28, 'Cheeseburger Dani', 1, 350.00),
(29, 28, 'Vegetariano (Taco)', 1, 400.00),
(30, 28, 'Vegano', 1, 400.00),
(31, 28, 'Papas Fritas', 1, 120.00),
(32, 28, 'Salsa Picante', 1, 50.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_historial`
--

CREATE TABLE `pedido_historial` (
  `id` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_historial`
--

INSERT INTO `pedido_historial` (`id`, `id_pedido`, `estado`, `fecha_hora`) VALUES
(70, 9, 'aceptado', '2025-10-21 18:39:51'),
(71, 9, 'en_preparacion', '2025-10-21 18:39:57'),
(72, 9, 'aceptado', '2025-10-21 19:11:10'),
(73, 13, 'aceptado', '2025-10-22 17:03:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_old`
--

CREATE TABLE `pedido_old` (
  `id_pedido` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `tracking_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_old`
--

INSERT INTO `pedido_old` (`id_pedido`, `id_cliente`, `fecha_hora`, `estado`, `total`, `tracking_code`) VALUES
(9, NULL, '2025-10-21 15:39:44', 'aceptado', 0.00, NULL),
(10, NULL, '2025-10-21 20:42:43', 'pendiente', 0.00, NULL),
(11, NULL, '2025-10-22 00:00:01', 'pendiente', 600.00, NULL),
(12, NULL, '2025-10-22 13:34:05', 'pendiente', 300.00, NULL),
(13, NULL, '2025-10-22 13:34:58', 'aceptado', 300.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `personalizable` tinyint(1) DEFAULT 0,
  `tamanos_precios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tamanos_precios`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `descripcion`, `categoria`, `precio`, `imagen_url`, `personalizable`, `tamanos_precios`) VALUES
(1, 'Burger Mestiza', 'Pan de papa con queso, carne smash 110gr, cheddar, salsa \"Mestiza\", cebollitas y pepinillos encurtidos.', 'Hamburguesas', 350.00, '/PROYECTO-FINAL/uploads/products/mestiza.png', 0, '{\"Simple\":300,\"Doble\":400,\"Triple\":500}'),
(2, 'Cheeseburger Dani', 'Pan de papa con queso, carne smash 110gr, cheddar, mostaza, ketchup y cebollitas brunoise.', 'Hamburguesas', 350.00, '/PROYECTO-FINAL/uploads/products/dani.png', 0, '{\"Simple\":300,\"Doble\":400,\"Triple\":500}'),
(3, 'Cheeseburger Javito', 'Pan de papa con queso, carne smash 110gr, cheddar.', 'Hamburguesas', 400.00, '/PROYECTO-FINAL/uploads/products/javito.png', 0, '{\"Simple\":300,\"Doble\":400,\"Triple\":500}'),
(4, 'Cheeseburger Kids', 'Pan de papa con queso, carne smash 110gr, cheddar, y aderezos.', 'Hamburguesas', 300.00, '/PROYECTO-FINAL/uploads/products/kids.png', 0, NULL),
(5, 'Vegetariana (Burger)', 'Pan de papa con queso, rodajas de zuccini a la plancha, salteado de verduras (morrón, zanahoria y cebolla), cheddar, salsa \"Mestiza\", cebollitas y pepinillos encurtidos.', 'Hamburguesas', 300.00, '/PROYECTO-FINAL/uploads/products/vegetariana.png', 0, NULL),
(6, 'Taco de Carne', 'Tortilla artesanal, base cremosa de queso, carne cortada a cuchillo, salteado de vegetales (cebolla, morrón, zanahoria) + Toppings', 'Tacos', 400.00, '/PROYECTO-FINAL/uploads/products/taco_carne.png', 0, NULL),
(7, 'Vegetariano (Taco)', 'Tortilla artesanal, base cremosa de queso, zucchini, salteado de vegetales (cebolla, morrón, zanahoria) + Toppings', 'Tacos', 400.00, '/PROYECTO-FINAL/uploads/products/taco_vegetariano.png', 0, NULL),
(8, 'Vegano', 'Tortilla artesanal, zucchini, salteado de vegetales (vebolla, morrón, zanahoria) + Toppings', 'Tacos', 400.00, '/PROYECTO-FINAL/uploads/products/taco_vegano.png', 0, NULL),
(9, 'Papas Fritas', 'Porción individual.', 'Papas Fritas', 120.00, '/PROYECTO-FINAL/uploads/products/fritas.png', 0, NULL),
(10, 'Salsa Picante', '', 'Toppings', 50.00, '/PROYECTO-FINAL/uploads/products/picante.png', 0, NULL),
(11, 'Guacamole', '', 'Toppings', 50.00, '/PROYECTO-FINAL/uploads/products/guacamole.png', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `personas` int(11) NOT NULL,
  `comentarios` text DEFAULT NULL,
  `estado` enum('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `nombre`, `telefono`, `email`, `fecha`, `hora`, `personas`, `comentarios`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Thiago Paulo', '099756927', 'paulothiagoemp@gmail.com', '2025-12-03', '11:02:00', 2, 'hamburguesas triples', 'pendiente', '2025-11-15 22:15:59', '2025-11-15 22:27:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sobre_nosotros`
--

CREATE TABLE `sobre_nosotros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `historia_parte1` text NOT NULL,
  `historia_parte2` text NOT NULL,
  `imagen1_url` varchar(255) DEFAULT NULL,
  `imagen2_url` varchar(255) DEFAULT NULL,
  `mapa_iframe_url` text DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sobre_nosotros`
--

INSERT INTO `sobre_nosotros` (`id`, `titulo`, `historia_parte1`, `historia_parte2`, `imagen1_url`, `imagen2_url`, `mapa_iframe_url`, `fecha_actualizacion`) VALUES
(1, 'Un Sueño Nacido en 2020', 'Mestiza Sabores Caseros nació en Colonia del Sacramento en plena pandemia de 2020, cuando Daniel Abbona y su familia decidieron transformar la incertidumbre en oportunidad. Lo que comenzó con una simple mesita en la feria de los domingos, hoy es un emprendimiento gastronómico que se ha convertido en infaltable en ferias, eventos y encuentros locales. Nuestro diferencial está en la artesanía y el corazón familiar que ponemos en cada plato. Elaboramos todo nosotros mismos: desde las tortillas y encurtidos hasta las salsas picantes y aderezos que acompañan nuestros tacos, smash burgers, bocatas y opciones vegetarianas y veganas. Cada bocado busca mantener un sabor único, constante y reconocible, que represente quiénes somos.', 'De la feria y la rambla pasamos a tener nuestro propio food truck, el primero en Colonia, que nos permitió ampliar la propuesta con hamburguesas de estilo americano y seguir creciendo junto a la comunidad que nos apoya. Hoy seguimos recorriendo ferias gastronómicas y cerveceras, ofreciendo delivery cuando no estamos en eventos, y acompañando también a familias, amigos y empresas en celebraciones privadas. Mestiza es eso: comida rápida hecha con cariño, tradición y el sabor casero de Uruguay, que creció desde lo simple para convertirse en un lugar de encuentro y disfrute.', './imagenes/inicio.heic', './imagenes/puesto.webp', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d157.07!2d-57.84275!3d-34.47169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9508933b28b61c77%3A0xc4f4474320e6f30d!2sBazzurro%201747%2C%2070000%20Colonia%20del%20Sacramento%2C%20Departamento%20de%20Colonia%2C%20Uruguay!5e0!3m2!1ses-419!2suy!4v1705886915152!5m2!1ses-419!2suy', '2025-10-15 00:42:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_admin`
--

CREATE TABLE `usuario_admin` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pass_hash` varchar(255) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_admin`
--

INSERT INTO `usuario_admin` (`id`, `nombre`, `email`, `pass_hash`, `creado_en`) VALUES
(1, 'Admin', 'admin@local', '$2y$10$Tps85GFmbUqBToXgI/xXGexUfx3/iOJHybZy3MSXtJ1/innJLM5tK', '2025-10-17 01:47:41');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carga`
--
ALTER TABLE `carga`
  ADD PRIMARY KEY (`id_carga`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD PRIMARY KEY (`id_evento`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `meta`
--
ALTER TABLE `meta`
  ADD PRIMARY KEY (`name`);

--
-- Indices de la tabla `opiniones`
--
ALTER TABLE `opiniones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`);

--
-- Indices de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ped_det_pedido` (`id_pedido`);

--
-- Indices de la tabla `pedido_historial`
--
ALTER TABLE `pedido_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `idx_hist_pedido` (`id_pedido`),
  ADD KEY `idx_hist_fecha` (`fecha_hora`);

--
-- Indices de la tabla `pedido_old`
--
ALTER TABLE `pedido_old`
  ADD PRIMARY KEY (`id_pedido`),
  ADD UNIQUE KEY `tracking_code` (`tracking_code`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `sobre_nosotros`
--
ALTER TABLE `sobre_nosotros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario_admin`
--
ALTER TABLE `usuario_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carga`
--
ALTER TABLE `carga`
  MODIFY `id_carga` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `opiniones`
--
ALTER TABLE `opiniones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `pedido_historial`
--
ALTER TABLE `pedido_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

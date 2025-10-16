-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-10-2025 a las 05:15:27
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
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `modificaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Burger Mestiza', 'Pan de papa con queso, carne smash 110gr, cheddar, salsa \"Mestiza\", cebollitas y pepinillos encurtidos.', 'Hamburguesas', 0.00, './imagenes/hamburguesa_mestiza.heic', 1, '{\"Simple\": 300.00, \"Doble\": 400.00, \"Triple\": 500.00}'),
(2, 'Cheeseburger Dani', 'Pan de papa con queso, carne smash 110gr, cheddar, mostaza, ketchup y cebollitas brunoise.', 'Hamburguesas', 0.00, './imagenes/hamburguesa dani.png', 1, '{\"Simple\": 300.00, \"Doble\": 400.00, \"Triple\": 500.00}'),
(3, 'Cheeseburger Javito', 'Pan de papa con queso, carne smash 110gr, cheddar.', 'Hamburguesas', 0.00, './imagenes/', 1, '{\"Simple\": 300.00, \"Doble\": 400.00, \"Triple\": 500.00}'),
(4, 'Cheeseburger Kids', 'Pan de papa con queso, carne smash 110gr, cheddar, y aderezos.', 'Hamburguesas', 300.00, './imagenes/', 0, NULL),
(5, 'Vegetariana (Burger)', 'Pan de papa con queso, rodajas de zuccini a la plancha, salteado de verduras (morrón, zanahoria y cebolla), cheddar, salsa \"Mestiza\", cebollitas y pepinillos encurtidos.', 'Hamburguesas', 300.00, './imagenes/', 0, NULL),
(6, 'Taco de Carne', 'Tortilla artesanal, base cremosa de queso, carne cortada a cuchillo, salteado de vegetales (cebolla, morrón, zanahoria) + Toppings', 'Tacos x 2', 400.00, './imagenes/taco carne.heic', 0, NULL),
(7, 'Vegetariano (Taco)', 'Tortilla artesanal, base cremosa de queso, zucchini, salteado de vegetales (cebolla, morrón, zanahoria) + Toppings', 'Tacos x 2', 400.00, './imagenes/taco vegetariano.png', 0, NULL),
(8, 'Vegano', 'Tortilla artesanal, zucchini, salteado de vegetales (vebolla, morrón, zanahoria) + Toppings', 'Tacos x 2', 400.00, './imagenes/', 0, NULL),
(9, 'Papas Fritas', 'Porción individual.', 'Papas Fritas', 120.00, './imagenes/', 0, NULL),
(10, 'Salsa Picante', '', 'Toppings', 0.00, './imagenes/salsa_picante.jpg', 0, NULL),
(11, 'Guacamole', '', 'Toppings', 0.00, './imagenes/guacamole.jpg', 0, NULL);

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
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `opiniones`
--
ALTER TABLE `opiniones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `sobre_nosotros`
--
ALTER TABLE `sobre_nosotros`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `opiniones`
--
ALTER TABLE `opiniones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `sobre_nosotros`
--
ALTER TABLE `sobre_nosotros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carga`
--
ALTER TABLE `carga`
  ADD CONSTRAINT `carga_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `carga_ibfk_2` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

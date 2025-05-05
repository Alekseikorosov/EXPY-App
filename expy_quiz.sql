-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2025 at 02:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expy_quiz`
--

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `answer_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `question_id`, `answer_text`, `is_correct`) VALUES
(329, 86, 'qwer1', 0),
(330, 86, 'qwer2', 1),
(331, 86, 'qwer3', 0),
(332, 86, 'qwer4', 0),
(333, 87, 'retyui', 1),
(334, 87, 'poihgc', 0),
(335, 87, 'iuhg', 0),
(336, 87, 'i,hgfd', 0),
(337, 88, 'qwer', 0),
(338, 88, 'qwe', 1),
(339, 88, 'we', 0),
(340, 88, 'we', 0),
(341, 89, 'qwer', 1),
(342, 89, 'wef', 0),
(343, 89, 'wer', 0),
(344, 89, 'wef', 0),
(345, 90, 'asdfvbn', 0),
(346, 90, 'gfd', 0),
(347, 90, 'gfd', 1),
(348, 90, 'gf', 0),
(409, 106, 'Option A for Test Quiz 1', 0),
(410, 106, 'Option B for Test Quiz 1', 1),
(411, 106, 'Option C for Test Quiz 1', 0),
(412, 106, 'Option D for Test Quiz 1', 0),
(421, 109, 'Option A for Test Quiz 4', 0),
(422, 109, 'Option B for Test Quiz 4', 1),
(423, 109, 'Option C for Test Quiz 4', 0),
(424, 109, 'Option D for Test Quiz 4', 0),
(437, 113, 'Option A for Test Quiz 8', 0),
(438, 113, 'Option B for Test Quiz 8', 1),
(439, 113, 'Option C for Test Quiz 8', 0),
(440, 113, 'Option D for Test Quiz 8', 0),
(441, 114, 'Option A for Test Quiz 9', 0),
(442, 114, 'Option B for Test Quiz 9', 1),
(443, 114, 'Option C for Test Quiz 9', 0),
(444, 114, 'Option D for Test Quiz 9', 0),
(445, 115, 'Option A for Test Quiz 10', 0),
(446, 115, 'Option B for Test Quiz 10', 1),
(447, 115, 'Option C for Test Quiz 10', 0),
(448, 115, 'Option D for Test Quiz 10', 0),
(453, 117, 'Option A for Test Quiz 12', 0),
(454, 117, 'Option B for Test Quiz 12', 1),
(455, 117, 'Option C for Test Quiz 12', 0),
(456, 117, 'Option D for Test Quiz 12', 0),
(457, 118, 'Option A for Test Quiz 13', 0),
(458, 118, 'Option B for Test Quiz 13', 1),
(459, 118, 'Option C for Test Quiz 13', 0),
(460, 118, 'Option D for Test Quiz 13', 0),
(461, 119, 'Option A for Test Quiz 14', 0),
(462, 119, 'Option B for Test Quiz 14', 1),
(463, 119, 'Option C for Test Quiz 14', 0),
(464, 119, 'Option D for Test Quiz 14', 0),
(469, 121, 'Option A for Test Quiz 16', 0),
(470, 121, 'Option B for Test Quiz 16', 1),
(471, 121, 'Option C for Test Quiz 16', 0),
(472, 121, 'Option D for Test Quiz 16', 0),
(473, 122, 'Option A for Test Quiz 17', 0),
(474, 122, 'Option B for Test Quiz 17', 1),
(475, 122, 'Option C for Test Quiz 17', 0),
(476, 122, 'Option D for Test Quiz 17', 0),
(477, 123, 'Option A for Test Quiz 18', 0),
(478, 123, 'Option B for Test Quiz 18', 1),
(479, 123, 'Option C for Test Quiz 18', 0),
(480, 123, 'Option D for Test Quiz 18', 0),
(485, 125, 'Option A for Test Quiz 20', 0),
(486, 125, 'Option B for Test Quiz 20', 1),
(487, 125, 'Option C for Test Quiz 20', 0),
(488, 125, 'Option D for Test Quiz 20', 0),
(509, 131, 'awd', 1),
(510, 131, 'daw', 0),
(511, 131, 'dwa', 0),
(512, 131, 'daw', 0),
(513, 132, 'awd', 0),
(514, 132, 'awd', 0),
(515, 132, 'awd', 1),
(516, 132, 'awd', 0),
(517, 133, 'awd', 0),
(518, 133, 'awd', 0),
(519, 133, 'awd', 1),
(520, 133, 'adw', 0),
(521, 134, 'awd', 0),
(522, 134, 'awd', 0),
(523, 134, 'awd', 1),
(524, 134, 'wa', 0),
(525, 135, 'awd', 0),
(526, 135, 'awd', 0),
(527, 135, 'awd', 1),
(528, 135, 'awd', 0),
(529, 136, 'awd', 0),
(530, 136, 'wad', 0),
(531, 136, 'daw', 1),
(532, 136, 'adw', 0),
(533, 137, 'daw', 0),
(534, 137, 'dwa', 0),
(535, 137, 'daw', 1),
(536, 137, 'adw', 0),
(537, 138, 'daw', 0),
(538, 138, 'dwa', 0),
(539, 138, 'wda', 1),
(540, 138, 'awd', 0),
(541, 139, 'da', 0),
(542, 139, 'adw', 0),
(543, 139, 'adw', 1),
(544, 139, 'awd', 0),
(545, 140, 'dwa', 0),
(546, 140, 'daw', 0),
(547, 140, 'dwa', 1),
(548, 140, 'dwa', 0),
(549, 141, 'awd', 0),
(550, 141, 'awd', 0),
(551, 141, 'wa', 1),
(552, 141, 'daw', 0),
(553, 142, 'awd', 0),
(554, 142, 'awd', 0),
(555, 142, 'wad', 0),
(556, 142, 'wad', 1),
(557, 143, 'awd', 0),
(558, 143, 'awd', 0),
(559, 143, 'awd', 1),
(560, 143, 'awd', 0),
(561, 144, 'awd', 0),
(562, 144, 'awd', 0),
(563, 144, 'awd', 0),
(564, 144, 'awd', 1),
(565, 145, 'awd', 0),
(566, 145, 'awd', 0),
(567, 145, 'awd', 0),
(568, 145, 'awd', 1),
(569, 146, 'awd', 0),
(570, 146, 'awd', 0),
(571, 146, 'awd', 0),
(572, 146, 'awd', 1),
(573, 147, 'awd', 0),
(574, 147, 'awd', 0),
(575, 147, 'awd', 1),
(576, 147, 'awd', 0),
(577, 148, 'awd', 0),
(578, 148, 'awd', 0),
(579, 148, 'awd', 0),
(580, 148, 'awd', 1),
(581, 149, 'awd', 0),
(582, 149, 'awd', 0),
(583, 149, 'awd', 1),
(584, 149, 'awd', 0),
(585, 150, 'awd', 0),
(586, 150, 'awd', 0),
(587, 150, 'awd', 1),
(588, 150, 'awd', 0),
(589, 151, 'awd', 0),
(590, 151, 'awd', 1),
(591, 151, 'awd', 0),
(592, 151, 'awd', 0),
(593, 152, 'awdawd', 0),
(594, 152, 'awdawd', 0),
(595, 152, 'awdawd', 1),
(596, 152, 'awdawd', 0),
(597, 153, 'awdawd', 0),
(598, 153, 'awdawd', 0),
(599, 153, 'awdawd', 1),
(600, 153, 'awdawd', 0),
(601, 154, 'awdawd', 0),
(602, 154, 'awdawd', 0),
(603, 154, 'awdawd', 1),
(604, 154, 'awdawd', 0),
(605, 155, 'awdawd', 0),
(606, 155, 'awdawd', 0),
(607, 155, 'awdawd', 1),
(608, 155, 'awdawd', 0),
(609, 156, 'awdawd', 0),
(610, 156, 'awdawd', 0),
(611, 156, 'awdawd', 0),
(612, 156, 'awdawd', 1),
(613, 157, 'awdawd', 0),
(614, 157, 'awdawd', 0),
(615, 157, 'awdawd', 1),
(616, 157, 'awdawd', 0),
(617, 158, 'awdawd', 0),
(618, 158, 'awdawd', 0),
(619, 158, 'awdawd', 1),
(620, 158, 'awdawd', 0),
(621, 159, 'awdawd', 0),
(622, 159, 'awdawd', 0),
(623, 159, 'awdawd', 1),
(624, 159, 'awdawd', 0),
(625, 160, 'awdawd', 0),
(626, 160, 'awdawd', 0),
(627, 160, 'awdawd', 1),
(628, 160, 'awdawd', 0);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(42, 'Agriculture'),
(46, 'Anthropology'),
(27, 'Architecture'),
(6, 'Art'),
(15, 'Astronomy'),
(12, 'Biology'),
(30, 'Business'),
(14, 'Chemistry'),
(3, 'Chess'),
(25, 'Cooking'),
(49, 'Cybersecurity'),
(29, 'Economics'),
(18, 'Education'),
(40, 'Engineering'),
(41, 'Environment'),
(26, 'Fashion'),
(32, 'Finance'),
(2, 'Football'),
(20, 'Gaming'),
(11, 'Geography'),
(38, 'Graphic Design'),
(10, 'History'),
(44, 'Journalism'),
(33, 'Law'),
(36, 'Linguistics'),
(9, 'Literature'),
(31, 'Marketing'),
(1, 'Mathematics'),
(28, 'Medicine'),
(48, 'Meteorology'),
(21, 'Movies'),
(5, 'Music'),
(43, 'Nutrition'),
(16, 'Philosophy'),
(23, 'Photography'),
(13, 'Physics'),
(37, 'Poetry'),
(34, 'Politics'),
(19, 'Programming'),
(17, 'Psychology'),
(35, 'Religion'),
(39, 'Robotics'),
(8, 'Science'),
(45, 'Sociology'),
(4, 'Sports'),
(47, 'Statistics'),
(7, 'Technology'),
(22, 'Theater'),
(24, 'Traveling'),
(50, 'Zoology');

-- --------------------------------------------------------

--
-- Table structure for table `emailconfirmations`
--

CREATE TABLE `emailconfirmations` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `confirmationCode` varchar(10) DEFAULT NULL,
  `codeExpires` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(100) NOT NULL,
  `confirmation_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`email`, `confirmation_code`, `expires_at`) VALUES
('juri.degtjarjov@ivkhk.ee', '939648', '2025-04-04 07:58:02');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `question_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `question_image`, `created_at`) VALUES
(86, 4, 'qwer?', NULL, '2025-04-04 10:23:46'),
(87, 4, 'wert?', NULL, '2025-04-04 10:23:46'),
(88, 4, 'wert?', NULL, '2025-04-04 10:23:46'),
(89, 4, 'wert?', NULL, '2025-04-04 10:23:46'),
(90, 4, 'wert?', NULL, '2025-04-04 10:23:46'),
(106, 210, 'Sample question for Test Quiz 1', NULL, '2025-04-08 18:20:00'),
(109, 213, 'Sample question for Test Quiz 4', NULL, '2025-04-08 18:23:00'),
(113, 217, 'Sample question for Test Quiz 8', NULL, '2025-04-08 18:27:00'),
(114, 218, 'Sample question for Test Quiz 9', NULL, '2025-04-08 18:28:00'),
(115, 219, 'Sample question for Test Quiz 10', NULL, '2025-04-08 18:29:00'),
(117, 221, 'Sample question for Test Quiz 12', NULL, '2025-04-08 18:31:00'),
(118, 222, 'Sample question for Test Quiz 13', NULL, '2025-04-08 18:32:00'),
(119, 223, 'Sample question for Test Quiz 14', NULL, '2025-04-08 18:33:00'),
(121, 225, 'Sample question for Test Quiz 16', NULL, '2025-04-08 18:35:00'),
(122, 226, 'Sample question for Test Quiz 17', NULL, '2025-04-08 18:36:00'),
(123, 227, 'Sample question for Test Quiz 18', NULL, '2025-04-08 18:37:00'),
(125, 229, 'Sample question for Test Quiz 20', NULL, '2025-04-08 18:39:00'),
(131, 230, 'adawd', NULL, '2025-04-24 10:56:31'),
(132, 230, 'awd', NULL, '2025-04-24 10:56:31'),
(133, 230, 'awd', NULL, '2025-04-24 10:56:31'),
(134, 230, 'awd', NULL, '2025-04-24 10:56:31'),
(135, 230, 'adw', NULL, '2025-04-24 10:56:31'),
(136, 231, 'fad', NULL, '2025-04-24 11:54:04'),
(137, 231, 'dwa', NULL, '2025-04-24 11:54:04'),
(138, 231, 'dwa', NULL, '2025-04-24 11:54:04'),
(139, 231, 'dwa', NULL, '2025-04-24 11:54:04'),
(140, 231, 'daw', NULL, '2025-04-24 11:54:04'),
(141, 232, 'wadwa', NULL, '2025-04-24 11:55:41'),
(142, 232, 'adw', NULL, '2025-04-24 11:55:41'),
(143, 232, 'awd', NULL, '2025-04-24 11:55:41'),
(144, 232, 'awd', NULL, '2025-04-24 11:55:41'),
(145, 232, 'awd', NULL, '2025-04-24 11:55:41'),
(146, 233, 'awd', NULL, '2025-04-24 11:56:22'),
(147, 233, 'awd', NULL, '2025-04-24 11:56:22'),
(148, 233, 'awd', NULL, '2025-04-24 11:56:23'),
(149, 233, 'awd', NULL, '2025-04-24 11:56:23'),
(150, 233, 'awd', NULL, '2025-04-24 11:56:23'),
(151, 234, 'awd', NULL, '2025-04-24 11:57:14'),
(152, 234, 'awdawd', NULL, '2025-04-24 11:57:14'),
(153, 234, 'awdawd', NULL, '2025-04-24 11:57:14'),
(154, 234, 'awdawd', NULL, '2025-04-24 11:57:14'),
(155, 234, 'awdawd', NULL, '2025-04-24 11:57:14'),
(156, 235, 'awdawd', NULL, '2025-04-24 11:57:51'),
(157, 235, 'awdawd', NULL, '2025-04-24 11:57:51'),
(158, 235, 'awdawd', NULL, '2025-04-24 11:57:51'),
(159, 235, 'awdawd', NULL, '2025-04-24 11:57:51'),
(160, 235, 'awdawd', NULL, '2025-04-24 11:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `question_quantity` int(11) NOT NULL,
  `creator_id` bigint(20) UNSIGNED NOT NULL,
  `cover` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `category_id`, `question_quantity`, `creator_id`, `cover`, `created_at`, `updated_at`) VALUES
(4, 'qwer2', 2, 5, 3, 'blob:http://localhost:3001/79f69d30-7482-4e05-a294-abc7c130de33', '2025-03-27 17:55:17', '2025-04-19 12:45:58'),
(210, 'Test Quiz 1', 1, 1, 3, 'https://example.com/cover1.jpg', '2025-04-08 18:00:00', '2025-04-24 11:18:00'),
(213, 'Test Quiz 4', 4, 1, 3, 'https://example.com/cover4.jpg', '2025-04-08 18:03:00', '2025-04-24 11:18:03'),
(217, 'Test Quiz 8', 8, 1, 4, 'https://example.com/cover8.jpg', '2025-04-08 18:07:00', '2025-04-08 18:07:00'),
(218, 'Test Quiz 9', 9, 1, 1, 'https://example.com/cover9.jpg', '2025-04-08 18:08:00', '2025-04-08 18:08:00'),
(219, 'Test Quiz 10', 10, 1, 2, 'https://example.com/cover10.jpg', '2025-04-08 18:09:00', '2025-04-08 18:09:00'),
(221, 'Test Quiz 12', 12, 1, 4, 'https://example.com/cover12.jpg', '2025-04-08 18:11:00', '2025-04-08 18:11:00'),
(222, 'Test Quiz 13', 13, 1, 1, 'https://example.com/cover13.jpg', '2025-04-08 18:12:00', '2025-04-08 18:12:00'),
(223, 'Test Quiz 14', 14, 1, 2, 'https://example.com/cover14.jpg', '2025-04-08 18:13:00', '2025-04-08 18:13:00'),
(225, 'Test Quiz 16', 16, 1, 4, 'https://example.com/cover16.jpg', '2025-04-08 18:15:00', '2025-04-08 18:15:00'),
(226, 'Test Quiz 17', 17, 1, 1, 'https://example.com/cover17.jpg', '2025-04-08 18:16:00', '2025-04-08 18:16:00'),
(227, 'Test Quiz 18', 18, 1, 2, 'https://example.com/cover18.jpg', '2025-04-08 18:17:00', '2025-04-08 18:17:00'),
(229, 'Test Quiz 20', 20, 1, 4, 'https://example.com/cover20.jpg', '2025-04-08 18:19:00', '2025-04-08 18:19:00'),
(230, 'Maksim', 5, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUUExMWFRUXGBcaGBgYFhcXGhgXGhgYGBgbGBoYHSggGBolGxcXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFysdFx0rKy0rKysrLSstLS0tKy0tLSstKy0tLS0tLS0tLSstLS0tNysrLSstKy0rLSstKzcrK//AABEIAKUBMgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EADgQAAEDAgQEAwcDBAMAAwAAAAEAAhEDIQQxQVEFEmFxgZGhBhMiMrHB8BTR4UJSYvEHIzMVU8L/xAAYAQADAQEAAAAAAAAAAAAAAAABAgMABP/EACERAQEAAgMBAQADAQEAAAAAAAABAhESITFBAyIyUUIT/9oADAMBAAIRAxEAPwAmq34bXgKXC1BtH1vun0x4/miaKtzC4', '2025-04-24 10:56:13', '2025-04-24 10:56:31'),
(231, 'test fuel 1', 5, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUWFxgYFxgXGBoXHRofFxgYGxoYGBgYHSggGB4lGxoXITEhJSkrLi4uGCAzODMtNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAQUAwQMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAAIHAQj/xABGEAABAgMEBwYDBgUDAgYDAAABAhEAAyEEMUFRBQYSYXGB8BMikaGxwSPR4QcUMkJS8RUzYnKygpLCJKJTY5Ojs8MWNEP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AuWl7QQZ0vKUS/MCKLpOb8dadvuhZ2g+Lt', '2025-04-24 11:54:04', '2025-04-24 11:54:04'),
(232, 'test fuel 2', 12, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUUExMWFRUXGBcaGBgYFhcXGhgXGhgYGBgbGBoYHSggGBolGxcXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFysdFx0rKy0rKysrLSstLS0tKy0tLSstKy0tLS0tLS0tLSstLS0tNysrLSstKy0rLSstKzcrK//AABEIAKUBMgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EADgQAAEDAgQEAwcDBAMAAwAAAAEAAhEDIQQxQVEFEmFxgZGhBhMiMrHB8BTR4UJSYvEHIzMVU8L/xAAYAQADAQEAAAAAAAAAAAAAAAABAgMABP/EACERAQEAAgMBAQADAQEAAAAAAAABAhESITFBAyIyUUIT/9oADAMBAAIRAxEAPwAmq34bXgKXC1BtH1vun0x4/miaKtzC4', '2025-04-24 11:55:41', '2025-04-24 11:55:41'),
(233, 'test fuel 3', 20, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTEhMVFRUXGBUVFxcVFxcXFxcXFRUXFxUXFxUdHSggGBolHRcVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFQ8QFy4dFR0tMi0rLS0rLi0tLS0tLS0tLS0tLS0rLS0tLS0tLSstLS0tLS0tLSstLS0tKy0tLS0tLf/AABEIAOEA4AMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAAAQIDBAYHBQj/xABOEAACAQICBwMGCQUNCQAAAAAAAQIDEQQhBRITMUFRYQZxgQciVJGx0jJCUpKTocHR8BUWF3KyFCQzNENEU2JzgrPC0yNjZIOio+Hi8f/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAJhEBAAIBAgUFAQEBAAAAAAAAAAECEQMTMTJSYaESFCEzUUHwQv/aAAwDAQACE', '2025-04-24 11:56:22', '2025-04-24 11:56:22'),
(234, 'awdawd', 16, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGRwbGRcYGCIfIRsgHxsdHh4gHyAfHyggHx8oHx4bIjEhJSkrLi4uGyEzODMtNygtLisBCgoKDg0OGxAQGysmICUrLTUvNy0tLS0vLS8tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAPwAyAMBIgACEQEDEQH/xAAbAAADAAMBAQAAAAAAAAAAAAAEBQYCAwcAAf/EAEAQAAIBAgQEBAQEBAUDBAMBAAECEQMhAAQSMQVBUWEGEyJxMoGRoRSxwfAjQtHhB1JicvEVgpIzk6KyU3PCFv/EABkBAAMBAQEAAAAAAAAAAAAAAAECAwQABf/EACsRAAICAgICAgEDAwUAAAAAAAECABEDIRIxIkEEURMyYXGhscGBkeHw8f/aAAwDAQACEQMRAD8ARu/O5', '2025-04-24 11:57:14', '2025-04-24 11:57:14'),
(235, 'awdawd', 14, 5, 3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUUExMWFRUXGBcaGBgYFhcXGhgXGhgYGBgbGBoYHSggGBolGxcXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFysdFx0rKy0rKysrLSstLS0tKy0tLSstKy0tLS0tLS0tLSstLS0tNysrLSstKy0rLSstKzcrK//AABEIAKUBMgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EADgQAAEDAgQEAwcDBAMAAwAAAAEAAhEDIQQxQVEFEmFxgZGhBhMiMrHB8BTR4UJSYvEHIzMVU8L/xAAYAQADAQEAAAAAAAAAAAAAAAABAgMABP/EACERAQEAAgMBAQADAQEAAAAAAAABAhESITFBAyIyUUIT/9oADAMBAAIRAxEAPwAmq34bXgKXC1BtH1vun0x4/miaKtzC4', '2025-04-24 11:57:51', '2025-04-24 11:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guest_id` varchar(64) DEFAULT NULL,
  `start_time` datetime DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL,
  `user_results` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('active','finished','cancelled') DEFAULT 'active',
  `final_score` int(11) DEFAULT NULL,
  `result_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `user_id`, `guest_id`, `start_time`, `end_time`, `user_results`, `status`, `final_score`, `result_token`) VALUES
(201, 4, NULL, 'f85cd796-2aa3-4e64-8daa-dd130b759c6d', '2025-04-04 20:22:35', '2025-04-04 20:22:47', '{\"86\":330,\"87\":333,\"88\":337,\"89\":341,\"90\":345}', 'finished', 3, NULL),
(202, 4, NULL, 'ab9e0d44-1d77-44bc-ba3a-c6653f442d98', '2025-04-04 20:50:37', '2025-04-04 20:50:40', '{\"86\":329,\"87\":333,\"88\":337,\"89\":341,\"90\":345}', 'finished', 2, NULL),
(217, 229, NULL, '42b81e8f-1b5f-4f41-91b8-28f0fc050fd9', '2025-04-19 15:01:45', '2025-04-19 15:01:46', '{\"125\":486}', 'finished', 1, NULL),
(250, 229, NULL, 'f2f28e5d-3397-41c5-b62b-efefd69ecb55', '2025-04-20 17:53:28', '2025-04-20 17:53:30', '{\"125\":486}', 'finished', 1, NULL),
(251, 229, NULL, '6c14aede-9c28-46d7-8c52-3873921badcd', '2025-04-20 17:53:52', '2025-04-20 17:54:00', '{\"125\":486}', 'finished', 1, '785d774e-bba9-47eb-8a79-f8ab819cf4f1'),
(260, 229, NULL, 'd71af895-8e3c-45d8-b1b3-cee95112faeb', '2025-04-20 17:59:23', '2025-04-20 18:02:29', '{\"125\":486}', 'finished', 1, NULL),
(261, 229, NULL, 'c3dadfbd-e0f5-4daa-b05a-9b05a95b348b', '2025-04-20 18:03:46', '2025-04-20 18:03:57', '{\"125\":487}', 'finished', 0, NULL),
(262, 229, NULL, '65eff384-ef53-450b-ab4e-af82a3e5b142', '2025-04-20 18:42:15', '2025-04-20 18:42:16', '{\"125\":487}', 'finished', 0, NULL),
(263, 229, NULL, 'd92b318b-a6c8-4c85-8d66-cf3ab80c0e36', '2025-04-20 18:42:32', '2025-04-20 18:42:36', '{\"125\":487}', 'finished', 0, NULL),
(264, 229, NULL, '16707856-11a1-4bc9-b57b-ae9fca516fe1', '2025-04-20 18:42:47', '2025-04-20 18:42:52', '{\"125\":487}', 'finished', 0, NULL),
(269, 227, NULL, '519c2318-3b66-4d59-ab3a-100729871a16', '2025-04-20 18:45:04', '2025-04-20 18:45:07', '{\"123\":480}', 'finished', 0, NULL),
(270, 222, NULL, '47cdb344-ba4d-476e-96fb-e924e6fa0ab3', '2025-04-20 18:46:12', '2025-04-20 18:46:13', '{\"118\":458}', 'finished', 1, NULL),
(271, 229, NULL, '0335a96f-63c3-4fe7-b6ea-47923ca51b99', '2025-04-20 18:46:16', '2025-04-20 18:46:17', '{\"125\":486}', 'finished', 1, NULL),
(272, 223, NULL, '8b6868a6-264d-4e74-b03c-a1c82f73cc0b', '2025-04-20 18:48:57', '2025-04-20 18:48:58', '{\"119\":462}', 'finished', 1, NULL),
(273, 223, NULL, 'b5cd4e40-da34-499c-acb7-79d85ab5bdb6', '2025-04-20 18:49:00', '2025-04-20 18:49:01', '{\"119\":462}', 'finished', 1, NULL),
(292, 210, 15, NULL, '2025-04-25 08:55:11', '2025-04-25 08:55:13', '{\"106\":410}', 'finished', 1, 'eb15a8d5-c433-46bc-8842-e5c46da97153'),
(293, 210, 15, NULL, '2025-04-25 08:55:16', '2025-04-25 08:55:18', '{\"106\":409}', 'finished', 0, '90c7d0c1-5551-4305-897a-2f4ac4baa9cd');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_progress`
--

CREATE TABLE `quiz_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `answered_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `correct_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `question_quantity` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `quiz_progress`
--

INSERT INTO `quiz_progress` (`id`, `user_id`, `quiz_id`, `answered_count`, `correct_count`, `question_quantity`, `created_at`, `updated_at`) VALUES
(1, 3, 229, 1, 1, 1, '2025-04-20 14:54:41', '2025-04-20 16:26:35'),
(2, 3, 4, 5, 5, 5, '2025-04-20 14:55:09', '2025-04-24 10:33:21'),
(12, 3, 227, 1, 1, 1, '2025-04-20 17:51:02', '2025-04-20 18:44:10'),
(18, 3, 219, 1, 1, 1, '2025-04-20 17:52:07', '2025-04-24 10:08:13'),
(30, 3, 226, 1, 1, 1, '2025-04-20 17:55:43', '2025-04-20 17:55:43'),
(31, 3, 225, 1, 1, 1, '2025-04-20 17:56:54', '2025-04-20 18:43:28'),
(33, 3, 223, 1, 1, 1, '2025-04-20 17:57:36', '2025-04-20 17:57:36'),
(48, 3, 222, 1, 1, 1, '2025-04-24 10:07:40', '2025-04-24 10:07:40'),
(49, 3, 218, 1, 1, 1, '2025-04-24 10:34:21', '2025-04-24 10:34:27'),
(51, 3, 230, 5, 4, 5, '2025-04-24 10:57:05', '2025-04-24 10:57:18'),
(52, 3, 221, 1, 1, 1, '2025-04-24 11:17:21', '2025-04-24 11:17:21'),
(53, 15, 210, 1, 1, 1, '2025-04-25 08:55:13', '2025-04-25 08:55:13'),
(54, 14, 231, 1, 0, 5, '2025-04-25 10:23:19', '2025-04-25 10:23:19'),
(55, 3, 231, 1, 0, 5, '2025-04-25 11:55:46', '2025-04-25 11:55:46');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `token` varchar(500) NOT NULL,
  `userId` bigint(20) UNSIGNED NOT NULL,
  `expiresAt` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`token`, `userId`, `expiresAt`, `created_at`, `id`) VALUES
('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsInVzZXJuYW1lIjoiZGZzZGZzZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ1NTc3NjI2LCJleHAiOjE3NDYxODI0MjZ9.1jdCC9w4dOilMx9ybzgM45uIeeRvY3UItUNINhUWkUM', 14, '2025-05-02 10:40:26', '2025-04-25 10:40:26', 1),
('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ0b3JrbGVlIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDU0OTMzOTcsImV4cCI6MTc0NjA5ODE5N30.EQLPnZPl4hyRCtqb4uU14pdtUT_ivwkT6ALRUxskAfQ', 3, '2025-05-01 11:16:37', '2025-04-24 11:16:37', 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `fuel` int(10) UNSIGNED NOT NULL DEFAULT 160,
  `fuel_updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `telephone`, `password`, `last_login`, `created_at`, `updated_at`, `role`, `fuel`, `fuel_updated_at`) VALUES
(1, 'admin', 'admin@example.com', NULL, 'hashed_admin_pass', NULL, '2025-03-25 20:44:08', '2025-04-25 10:40:00', 'admin', 160, '2025-04-25 10:34:33'),
(2, 'bob', 'bob@example.com', NULL, 'hashed_bob_pass', NULL, '2025-03-25 20:44:08', '2025-04-25 10:40:00', 'user', 160, '2025-04-25 10:34:33'),
(3, 'uia-uia', 'juri.degtjarjov@gmail.com', '53440432', '$2b$10$QNGSF/Y/XExTEq2gES.IQOsaWPZP/Bb/FkdmgpJc/RTzflRnKS9pK', '2025-04-25 11:33:31', '2025-03-25 20:46:38', '2025-04-25 12:06:00', 'user', 115, '2025-04-25 12:05:51'),
(4, 'qwer', 'qewr@mail.ru', '5678903', '$2b$10$BD3oB1XAHXaENWzcnW.6suS07lnLhI7oaF./tpuWVBOLl7vWZ1GoG', '2025-03-27 17:49:27', '2025-03-27 17:48:28', '2025-04-25 10:40:00', 'user', 160, '2025-04-25 10:34:33'),
(5, 'tupoj', 'rwer3985@gmail.com', '5678906', '$2b$10$GneYVdov9NJWYMwfT.nCLuVutwbgBfaduzYOQU7qqNl76JWhxRSpG', NULL, '2025-03-27 21:38:56', '2025-04-25 10:40:00', 'user', 160, '2025-04-25 10:34:33'),
(7, 'Alexesdfgh', 'vvvvvvvvvvr34lmysdfghjste@gmail.com', '56328543', '$2b$10$YuD098w82vyk53HHPGQN4uHRBOQP7.w/IKa4Jr3IZE4LJ7jr72FE.', NULL, '2025-03-29 18:08:03', '2025-04-25 10:40:00', 'user', 160, '2025-04-25 10:34:33'),
(13, 'Alex_korsh', 'aleksei.korosov1@gmail.com', NULL, '$2b$10$RtAeHsZznZ1MuKd6ro9iMuoWMQth0iMFEyhSHXcHB0D0dcMCmEoWy', '2025-03-31 21:16:26', '2025-03-30 20:32:41', '2025-04-25 12:03:00', 'user', 21, '2025-04-25 12:02:33'),
(14, 'dfsdfsd', 'juri.degtjarjov@ivkhk.ee', '53440431', '$2b$10$Mj0cJ6D4efHTip2sCNcWa.yd4Wy1Lk4GKLHe5vq18wIa8dswVT5iS', '2025-04-25 10:40:26', '2025-04-01 06:04:30', '2025-04-25 12:03:00', 'user', 115, '2025-04-25 12:02:33'),
(15, 'mark', 'mark.baranjuk@ivkhk.ee', '5139556', '$2b$10$ePtdTn2/If.2MoIr/GFUnOHyTl/uIAoXR2GYxWB9Ljc9HeOXJ8kHu', '2025-04-25 08:54:26', '2025-04-25 08:53:36', '2025-04-25 12:06:00', 'user', 9, '2025-04-25 12:05:36'),
(16, 'Testfuel1', 'testfuel1@gmail.com', '213421', '$2b$10$PgkhKQQDRi9A2QWVMJaayuEMsjYIVTdTh2JvLskifx1GekjyxeJhS', NULL, '2025-04-25 10:52:37', '2025-04-25 12:05:00', 'user', 159, '2025-04-25 12:04:37'),
(17, 'testreg', 'testreg@gmail.com', '2134212143', '$2b$10$SDD7vxZ5nb.7DI8OK.OyTe.IBwT4NGvd5g/bZ/L3deUgKi1TWVrem', '2025-04-25 11:09:16', '2025-04-25 11:09:01', '2025-04-25 11:09:16', 'user', 160, '2025-04-25 11:09:01');

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

CREATE TABLE `user_favorites` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `user_favorites`
--

INSERT INTO `user_favorites` (`user_id`, `quiz_id`, `added_at`) VALUES
(3, 4, '2025-04-19 19:24:45'),
(3, 230, '2025-04-24 10:57:39'),
(14, 231, '2025-04-25 10:22:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_recovery_codes`
--

CREATE TABLE `user_recovery_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_two_factor`
--

CREATE TABLE `user_two_factor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `totp_secret` varchar(255) DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_question_id` (`question_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_categories_name` (`name`);

--
-- Indexes for table `emailconfirmations`
--
ALTER TABLE `emailconfirmations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quiz_id` (`quiz_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_creator_id` (`creator_id`),
  ADD KEY `idx_category_id` (`category_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_attempt` (`user_id`),
  ADD KEY `fk_quiz_attempt` (`quiz_id`);

--
-- Indexes for table `quiz_progress`
--
ALTER TABLE `quiz_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_quiz_progress_user_quiz` (`user_id`,`quiz_id`),
  ADD KEY `idx_qp_user` (`user_id`),
  ADD KEY `idx_qp_quiz` (`quiz_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_telephone` (`telephone`);

--
-- Indexes for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`user_id`,`quiz_id`),
  ADD KEY `idx_fav_quiz_id` (`quiz_id`);

--
-- Indexes for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_recovery_codes_user_id` (`user_id`);

--
-- Indexes for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_utf_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=629;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `emailconfirmations`
--
ALTER TABLE `emailconfirmations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=297;

--
-- AUTO_INCREMENT for table `quiz_progress`
--
ALTER TABLE `quiz_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quizzes_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_quizzes_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `fk_quiz_attempt` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_attempt` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `quiz_progress`
--
ALTER TABLE `quiz_progress`
  ADD CONSTRAINT `fk_quiz_progress_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quiz_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `fk_user_favorites_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  ADD CONSTRAINT `fk_user_recovery_codes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  ADD CONSTRAINT `fk_user_two_factor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

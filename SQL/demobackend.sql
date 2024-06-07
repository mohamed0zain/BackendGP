-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2024 at 04:52 AM
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
-- Database: `demobackend`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `admin_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_name`, `admin_email`, `admin_password`, `admin_token`) VALUES
(1, 'Admin', 'admin@fci.helwan.edu.eg', 'Admin', '30245e04e42ecb9361e314c8d5bce275'),
(4, 'Admin', 'admin1@fci.helwan.edu.eg', '$2b$10$1c0pV927qvVwgq4zZ02vgeN/SD1mdYT4sLnjOZxf/O2HBlvKgeLeW', 'f703f7bc42efdd977a8dbabdc63e55be');

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `bookmark_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `total_votes` int(11) DEFAULT NULL,
  `bookmark_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookmarks`
--

INSERT INTO `bookmarks` (`bookmark_id`, `student_id`, `project_id`, `title`, `department_name`, `total_votes`, `bookmark_timestamp`) VALUES
(16, 202000762, 1, 'ay klam', 'Information Systems', 5, '2024-06-07 00:35:04');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `commenter_id` int(11) DEFAULT NULL,
  `comment_text` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `commenter_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`comment_id`, `project_id`, `commenter_id`, `comment_text`, `timestamp`, `commenter_name`) VALUES
(4, 1, 202000762, 'This is a test comment.', '2024-05-03 22:03:23', 'Mohamed Zain'),
(16, 1, 202000761, 'Your comment text here', '2024-05-04 10:45:28', 'Mohamed Zain'),
(18, 4, 202000761, 'Your comment text here', '2024-05-06 15:40:52', 'Mohamed Zain');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `notification_type` enum('vote','comment','project_request','project_status_update','grade_update') NOT NULL,
  `project_id` int(11) NOT NULL,
  `read_status` enum('unread','read') NOT NULL DEFAULT 'unread',
  `notification_message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `recipient_id`, `sender_id`, `notification_type`, `project_id`, `read_status`, `notification_message`, `timestamp`) VALUES
(42, 202000762, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:45'),
(43, 202000210, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:45'),
(44, 202000752, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:45'),
(45, 202000762, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:49'),
(46, 202000210, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:49'),
(47, 202000752, 202000762, 'vote', 28, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:31:49'),
(48, 202000999, 202000762, 'comment', 31, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:32:12'),
(49, 202000333, 202000762, 'comment', 31, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:32:12'),
(50, 202000555, 202000762, 'comment', 31, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:32:12'),
(51, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:37'),
(52, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:37'),
(53, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:37'),
(54, 202000999, 202000762, 'vote', 31, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:42'),
(55, 202000333, 202000762, 'vote', 31, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:42'),
(56, 202000555, 202000762, 'vote', 31, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:42'),
(57, 202000777, 202000762, 'vote', 30, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:43'),
(58, 202000222, 202000762, 'vote', 30, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:43'),
(59, 202000232, 202000762, 'vote', 30, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:43'),
(60, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:45'),
(61, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:45'),
(62, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:32:45'),
(63, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:35'),
(64, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:35'),
(65, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:35'),
(66, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:37'),
(67, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:37'),
(68, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:37'),
(69, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(70, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(71, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(72, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(73, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(74, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:34:38'),
(75, 202100001, 202000762, 'comment', 1, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:34:55'),
(76, 202100002, 202000762, 'comment', 1, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:34:56'),
(77, 202100003, 202000762, 'comment', 1, 'unread', 'User with id 202000762 has added a comment to your project.', '2024-06-07 00:34:56'),
(78, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:19'),
(79, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:19'),
(80, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:19'),
(81, 202100001, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:22'),
(82, 202100002, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:22'),
(83, 202100003, 202000762, 'vote', 1, 'unread', 'User with id 202000762 has upvoted your project.', '2024-06-07 00:35:22'),
(84, 121, 809000586, 'project_status_update', 33, 'unread', 'Your project has been accepted by Professor Abdelrahman', '2024-06-07 00:39:22'),
(85, 122, 809000586, 'project_status_update', 33, 'unread', 'Your project has been accepted by Professor Abdelrahman', '2024-06-07 00:39:22'),
(86, 123, 809000586, 'project_status_update', 33, 'unread', 'Your project has been accepted by Professor Abdelrahman', '2024-06-07 00:39:22'),
(87, 20200076, 809000586, 'project_status_update', 34, 'unread', 'Your project has been rejected by Professor Abdelrahman', '2024-06-07 00:39:23'),
(88, 20200024, 809000586, 'project_status_update', 34, 'unread', 'Your project has been rejected by Professor Abdelrahman', '2024-06-07 00:39:23');

-- --------------------------------------------------------

--
-- Table structure for table `professor`
--

CREATE TABLE `professor` (
  `professor_id` int(11) NOT NULL,
  `professor_name` varchar(255) NOT NULL,
  `professor_email` varchar(255) NOT NULL,
  `professor_password` varchar(255) NOT NULL,
  `professor_department` varchar(255) NOT NULL,
  `professor_token` varchar(255) NOT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professor`
--

INSERT INTO `professor` (`professor_id`, `professor_name`, `professor_email`, `professor_password`, `professor_department`, `professor_token`, `reset_password_token`, `reset_password_expires`) VALUES
(20200, 'Abdelrahman ahmed', 'abdo0o00.ahmed@fci.helwan.edu.eg', '$2b$10$hRL/SnKx1d5s67xQnEpS0eT7bgtIUVGg4b9DGiDfPqmWfVjYZ5R.W', 'Computer Science', '9daec50ca8ca7806ea4ace97d3c42f2b', NULL, NULL),
(202020, 'Mohamed zain', 'john@fci.helwan.edu.eg', '$2b$10$/6sh0q/ljw3Sy11263wTb.DxuYy/sXC5qCywnY4Sn/ycB0MgwHw1.', 'Computer Science', 'e4278d576a817192f8e54bd3a95b14df', NULL, NULL),
(202000496, 'Hany Abdelrazek', 'hanyhany@fci.helwan.edu.eg', '$2b$10$Xpqq1qOtAtFB760uVb7inuF8Az09xDhXUUW5FN7t6TJlNvT5nTpvu', 'is', '1090d36f6a263870b47346abca52750d', NULL, NULL),
(809000586, 'Abdelrahman', 'Ebnelnas@fci.helwan.edu.eg', '$2b$10$a.pB3OEu/PHOoeBGgZmawOH7T9gomGVIZBNOgnqjaIYURZs0wqBxe', 'cs', '11b64be21f3505c499a80ce58b8c4ddd', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `graduation_year` int(11) DEFAULT NULL,
  `graduation_term` enum('June','January','Summer') DEFAULT NULL,
  `department_name` enum('Computer Science','Information Systems','Information Technology') DEFAULT NULL,
  `project_files_path` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `total_votes` int(11) DEFAULT 0,
  `professor_id` int(11) DEFAULT NULL,
  `registration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `title`, `description`, `supervisor_name`, `graduation_year`, `graduation_term`, `department_name`, `project_files_path`, `github_link`, `approval_status`, `total_votes`, `professor_id`, `registration_date`) VALUES
(1, 'ay klam', 'hello', 'mar3333eeeeeeeeeeee', 2023, 'June', 'Information Systems', NULL, 'ay 7aga', 'Approved', 6, NULL, '2024-05-06'),
(2, 'Project Title123', 'gthgtughurrreuifhfhhfj', 'Supervisor Name', 2024, 'June', 'Information Technology', NULL, 'https://github.com/example/project', 'Rejected', 1, NULL, NULL),
(3, 'hamadahamada', 'hamadahamada', 'hamadahamada', 2022, 'June', '', NULL, 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(4, 'GPMS', 'kter', 'DR MAray', 2021, 'Summer', 'Information Systems', 'project_files\\1714685518174.rar', 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(5, 'hamadahamada1333', 'hamadahamada', 'hamadahamada111', 2023, 'January', 'Computer Science', NULL, 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(28, 'ay klam', 'hello', 'mar3333eeeeeeeeeeee', 2024, 'January', 'Computer Science', NULL, 'ay 7aga', 'Pending', 1, NULL, NULL),
(29, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, 'Summer', 'Information Systems', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(30, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2021, 'June', 'Information Systems', NULL, 'ta3ban', 'Approved', 1, NULL, NULL),
(31, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2021, 'January', 'Information Systems', NULL, 'ta3ban', 'Approved', 1, NULL, '2024-05-05'),
(32, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2023, 'Summer', 'Computer Science', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(33, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2024, 'January', 'Information Systems', NULL, 'ta3ban', 'Approved', 0, 809000586, '2024-06-07'),
(34, 'Sample Project', 'This is a sample project description', 'Mohamed Maray', 2022, 'January', 'Information Technology', 'project_files\\1715007907218.png', 'https://github.com/sample/project', 'Rejected', 0, 809000586, NULL),
(35, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2022, 'Summer', '', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(36, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2023, 'Summer', 'Computer Science', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(37, 'zain', 'zain', 'Maray', 2024, 'June', 'Information Systems', 'project_files\\1715094311267.rar', 'zain.com', 'Pending', 0, 20200, NULL),
(38, 'zain', 'zain bardo', 'Maray', 2025, 'June', 'Information Systems', 'project_files\\1715050538588.png', 'zain.com', 'Pending', 0, 20200, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_professor`
--

CREATE TABLE `project_professor` (
  `project_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_professor`
--

INSERT INTO `project_professor` (`project_id`, `professor_id`) VALUES
(30, 809000586),
(30, 809000586),
(31, 809000586),
(1, 20200),
(33, 809000586);

-- --------------------------------------------------------

--
-- Table structure for table `project_students`
--

CREATE TABLE `project_students` (
  `project_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `semester_work_grade` decimal(5,2) DEFAULT NULL,
  `final_work_grade` decimal(5,2) DEFAULT NULL,
  `max_semester_work_grade` decimal(5,2) DEFAULT NULL,
  `max_final_work_grade` decimal(5,2) DEFAULT NULL,
  `overall_grade` decimal(5,2) GENERATED ALWAYS AS (`semester_work_grade` + `final_work_grade`) VIRTUAL,
  `max_overall_grade` decimal(5,2) GENERATED ALWAYS AS (`max_semester_work_grade` + `max_final_work_grade`) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_students`
--

INSERT INTO `project_students` (`project_id`, `student_name`, `student_id`, `semester_work_grade`, `final_work_grade`, `max_semester_work_grade`, `max_final_work_grade`) VALUES
(3, 'Jane Smith', '16', NULL, NULL, NULL, NULL),
(3, 'Mike Jones', '17', NULL, NULL, NULL, NULL),
(28, 'Zain', '202000762', NULL, NULL, NULL, NULL),
(28, 'Hazem', '202000210', NULL, NULL, NULL, NULL),
(28, 'Abdelrahman', '202000752', NULL, NULL, NULL, NULL),
(29, 'hhhhn', '202000777', NULL, NULL, NULL, NULL),
(29, 'Hazeyyy', '202000222', NULL, NULL, NULL, NULL),
(29, 'Abdelrahman', '202000232', NULL, NULL, NULL, NULL),
(30, 'hhhhn', '202000777', NULL, NULL, NULL, NULL),
(30, 'Hazeyyy', '202000222', 60.00, 150.00, 100.00, 200.00),
(30, 'Abdelrahman', '202000232', NULL, NULL, NULL, NULL),
(31, 'messi', '202000999', 500.00, 500.00, 500.00, 500.00),
(31, 'abdelsalam', '202000333', NULL, NULL, NULL, NULL),
(31, 'embabe', '202000555', NULL, NULL, NULL, NULL),
(32, 'messi', '202000666', NULL, NULL, NULL, NULL),
(32, 'abdelsalam', '202000888', NULL, NULL, NULL, NULL),
(32, 'embabe', '202000111', NULL, NULL, NULL, NULL),
(33, 'messi', '121', NULL, NULL, NULL, NULL),
(33, 'abdelsalam', '122', NULL, NULL, NULL, NULL),
(33, 'embabe', '123', NULL, NULL, NULL, NULL),
(1, 'John Doe', '202100001', 85.50, 90.00, 100.00, 100.00),
(1, 'Jane Smith', '202100002', 78.00, 85.50, 100.00, 100.00),
(1, 'Alice Johnson', '202100003', 92.00, 88.50, 100.00, 100.00),
(2, 'John Doe', '123456', 80.00, 85.00, 90.00, 95.00),
(2, 'Jane Smith', '789012', 75.00, 90.00, 85.00, 92.00),
(2, 'Alice Johnson', '345678', 85.00, 80.00, 88.00, 87.00),
(34, 'Mohamed zain-Elabdeen', '20200076', NULL, NULL, NULL, NULL),
(34, 'Hazem Hamdy', '20200024', NULL, NULL, NULL, NULL),
(35, 'hhhhn', '2020007', NULL, NULL, NULL, NULL),
(35, 'Hazeyyy', '2020002', NULL, NULL, NULL, NULL),
(35, 'Abdelrahman', '2020032', NULL, NULL, NULL, NULL),
(36, 'hhhhn', '202000700', NULL, NULL, NULL, NULL),
(36, 'Hazeyyy', '202000000', NULL, NULL, NULL, NULL),
(37, 'zainjr', '1010', NULL, NULL, NULL, NULL),
(38, 'zainjr', '10100', NULL, NULL, NULL, NULL);

--
-- Triggers `project_students`
--
DELIMITER $$
CREATE TRIGGER `update_max_overall_grade` BEFORE UPDATE ON `project_students` FOR EACH ROW BEGIN
    SET NEW.max_overall_grade = NEW.max_semester_work_grade + NEW.max_final_work_grade;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_overall_grade` BEFORE UPDATE ON `project_students` FOR EACH ROW BEGIN
    SET NEW.overall_grade = NEW.semester_work_grade + NEW.final_work_grade;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  `student_department` varchar(255) DEFAULT NULL,
  `student_token` varchar(255) NOT NULL DEFAULT 'hello',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_name`, `student_email`, `student_password`, `student_department`, `student_token`, `reset_password_token`, `reset_password_expires`) VALUES
(7, 'Mohamed Zain', 'Mohamed_Zain@fci.helwan.edu.eg', '$2b$10$HboC7yQbxbNbfNAGhnrif.n0H/0Br6xw1bORhSzRUYqPlSk.vQYwG', NULL, '64fa3d60ebb4be5d98e65ac11b129971', NULL, NULL),
(8, 'Mohamed Ahmed', 'Mohamed_Ahmed@fci.helwan.edu.eg', '$2b$10$h3qVOArAI..W4ZdIDvH6/uyBXKMGPq9khAOrio.TrTye5UH1M48i6', NULL, '6ef85404ec5c8b999f5f703584379e37', NULL, NULL),
(9, 'admin admin', 'admin@fci.helwan.edu.eg', '$2b$10$Rrz45r/CQ1JT3P9H12MYMOYcNMZJb2UDp3g7mxELtvWvtJpxntdBy', NULL, '', NULL, NULL),
(10, 'admin hello', 'helllllllll@fci.helwan.edu.eg', '$2b$10$2imy8DN1H3vZ9vGdzjjDwepImLKKZ/sxbulWUmXEzQ7cJdm.JzM3q', NULL, '', NULL, NULL),
(11, 'admin hello', 'youyou@fci.helwan.edu.eg', '$2b$10$k3anRZtkhnlQmDhDSOk7SOX3aAKrItRbYbqbptMcWdeD7ZRGeemA6', NULL, '', NULL, NULL),
(202000245, 'Hazem hamdy', 'hazem@fci.helwan.edu.eg', '$2b$10$.wt2iATEk/59LHhiQEouOeOSGXapJTmfbLVDIVojzg6naWmY85aKi', 'Software Engineering', '79673a812778cc0556aaa47818ce0bb4', NULL, NULL),
(202000760, '’Mohamed Zain', 'Mohamedzain235@fci.helwan.edu.eg', '$2b$10$.2axmfsaKj2EcgKFbnGqv.uhfu8FPJWmIWAEkk3NWcBufhaK8IBla', 'Information systems', 'f940a7a81f9a45bfd8f0dc715b6c8e70', NULL, NULL),
(202000761, 'Mohamed Zain', 'jon@fci.helwan.edu.eg', '$2b$10$vlsDivDwlWUXlpuoZ121p.3HuvqNDWhdo3DlmNv.VoXhFB/0qKPv6', 'Software Engineering', 'e210490bdddfb37828ec7a9e8b8604cd', NULL, NULL),
(202000762, 'Mohamed Zain', 'Mohamedzai@fci.helwan.edu.eg', '$2b$10$67/Kw9OgUj29o.X1e74C8uUGNbhATI.ynlR9NB80aXZYu4xE9v8Jy', 'Software Engineering', '8bd141c0d021701ee86a782dd44cdda2', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `vote_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `votes`
--

INSERT INTO `votes` (`vote_id`, `project_id`, `student_id`, `timestamp`) VALUES
(5, 28, 202000762, '2024-06-06 21:31:49'),
(7, 31, 202000762, '2024-06-06 21:32:42'),
(8, 30, 202000762, '2024-06-06 21:32:43'),
(15, 1, 202000762, '2024-06-06 21:35:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `admin_email` (`admin_email`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`bookmark_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `commenter_id` (`commenter_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `professor`
--
ALTER TABLE `professor`
  ADD UNIQUE KEY `professor_id` (`professor_id`),
  ADD UNIQUE KEY `professor_email` (`professor_email`),
  ADD KEY `professor_id_index` (`professor_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`);

--
-- Indexes for table `project_professor`
--
ALTER TABLE `project_professor`
  ADD KEY `project_id` (`project_id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- Indexes for table `project_students`
--
ALTER TABLE `project_students`
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`vote_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `bookmarks`
--
ALTER TABLE `bookmarks`
  MODIFY `bookmark_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `vote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`commenter_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `project_professor`
--
ALTER TABLE `project_professor`
  ADD CONSTRAINT `project_professor_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `project_professor_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`professor_id`);

--
-- Constraints for table `project_students`
--
ALTER TABLE `project_students`
  ADD CONSTRAINT `project_students_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

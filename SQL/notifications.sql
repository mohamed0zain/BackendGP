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


ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;
COMMIT;



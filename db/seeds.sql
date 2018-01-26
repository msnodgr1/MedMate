INSERT INTO users (id, user_name, login_name, email_address, password, active_status) VALUES (1, 'Granny', 'Granny-Pants', 'pill-poppin-gma@mail.com', 'pazwurd', 1);

INSERT INTO meds (id, med_name, med_dose, freq_main, freq_times, hr_interval, start_time, start_date, first_med, next_med, instructions, initial_count, remaining_count, active_status, createdAt, updatedAt, UserId) 
VALUES (1, 'Viagra', '100 MG', 'DAILY', 6, '04:00:00', '08:00:00', '2018-01-01 05:00:00','2018-01-01 08:00:00','2018-01-01 12:00:00','Take with bottle of wine', 300, 300, 1, '2018-01-06 04:23:44', '2018-01-06 04:23:44', 1);

select * from users;
select * from meds;
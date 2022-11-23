-- Database: restaurant

-- DROP DATABASE IF EXISTS restaurant;

--  CREATE DATABASE restaurant
--      WITH
--      OWNER = postgres
--      ENCODING = 'UTF8'
--      LC_COLLATE = 'en_US.utf8'
--      LC_CTYPE = 'en_US.utf8'
--      TABLESPACE = pg_default
--      CONNECTION LIMIT = -1
-- 	 TEMPLATE template0
--      IS_TEMPLATE = False;

-- Create TYPE basic_status AS ENUM ('ACTIVE', 'INACTIVE');
-- CREATE TYPE user_status AS ENUM ('ONLINE', 'OFFLINE', 'INACTIVE');
-- CREATE TYPE table_status AS ENUM ('NOT_USE', 'IN_USE', 'INACTIVE');
-- CREATE TYPE	check_status AS ENUM ('ACTIVE', 'CLOSED', 'VOID');
-- CREATE TYPE	checkdetail_status AS ENUM ('WAITING', 'READY', 'SERVED','RECALL', 'VOID');
-- Create TYPE bill_status AS ENUM ('CLOSED','REFUND');
-- Create TYPE cashierlog_type AS ENUM ('OPEN','CLOSED');

-- CREATE TABLE role (
-- 	id serial primary key,
-- 	name text UNIQUE not null
-- );
	
-- CREATE TABLE account (
--   id serial primary key,
--   username text unique NOT NULL,
--   password text NOT NULL,
--   fullName text NOT NULL,
--   avatar text DEFAULT NULL,
--   email text unique NOT NULL,
--   phone text unique NOT NULL,
--   status user_status default 'OFFLINE',
--   roleId integer NOT NULL references role(id)
-- );

-- CREATE TABLE worksession (
--   id serial primary key,
--   workDate date NOT NULL,
--   isOpen boolean NOT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL
-- );

-- CREATE TABLE voidreason (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE location (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status default 'ACTIVE'
-- );

-- CREATE TABLE shift (
--   id serial primary key,
--   workSessionId integer NOT NULL references worksession(id),
--   name text NOT NULL,
--   startTime time NOT NULL,
--   endTime time NOT NULL,
--   openerId integer DEFAULT NULL,
--   closerId integer DEFAULT NULL,
--   isOpen boolean NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE "table" (
--   id serial primary key,
--   locationId integer NOT NULL references location(id),
--   name text NOT NULL,
--   seat integer NOT NULL,
--   status table_status NOT NULL default 'NOT_USE'
-- );

-- CREATE TABLE "check" (
--   id serial primary key,
--   shiftId integer NOT NULL references shift(id),
--   accountId integer NOT NULL references account(id),
--   tableId int NOT NULL references "table"(id),
--   voidReasonId int DEFAULT NULL references voidreason(id),
--   checkNo text UNIQUE NOT NULL,
--   guestName text DEFAULT NULL,
--   cover integer DEFAULT NULL,
--   subtotal NUMERIC NOT NULL,
--   totalTax NUMERIC NOT NULL,
--   totalAmount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL,
--   status check_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE bill (
--   id serial primary key,
--   checkId integer NOT NULL references "check"(id),
--   billNo text unique NOT NULL,
--   guestName text DEFAULT NULL,
--   subtotal NUMERIC NOT NULL,
--   totalTax NUMERIC NOT NULL,
--   totalAmount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL,
--   status bill_status NOT NULL default 'CLOSED'
-- );

-- CREATE TABLE majorgroup (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE item (
--   id serial primary key,
--   majorGroupId integer NOT NULL references majorgroup(id),
--   image text DEFAULT NULL,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE billdetail (
--   id serial primary key,
--   billId integer not null references bill(id),
--   itemId integer NOT NULL references item(id),
--   itemName text NOT NULL,
--   itemPrice NUMERIC NOT NULL,
--   quantity float8 NOT NULL,
--   subtotal NUMERIC NOT NULL,
--   taxAmount NUMERIC NOT NULL,
--   amount NUMERIC NOT NULL
-- );

-- CREATE TABLE paymentmethod (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE billpayment (
--   id serial primary key,
--   billId integer not null references bill(id),
--   paymentMethodId int NOT NULL references paymentmethod(id),
--   paymentMethodName text NOT NULL,
--   amountReceive NUMERIC NOT NULL
-- );

-- CREATE TABLE checkdetail (
--   id serial primary key,
--   checkId integer NOT NULL references "check"(id) ON DELETE CASCADE,
--   itemId integer NOT NULL references item(id),
--   voidReasonId int DEFAULT NULL references voidreason(id),
--   itemPrice NUMERIC NOT NULL,
--   quantity float8 NOT NULL,
--   subtotal NUMERIC NOT NULL,
--   taxAmount NUMERIC NOT NULL,
--   amount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   isReminded boolean NOT NULL,
--   status checkdetail_status NOT NULL default 'WAITING',
--   startTime time without time zone NOT NULL,
--   completionTime time without time zone default NULL
-- );

-- CREATE TABLE specialrequest (
--   id serial primary key,
--   majorGroupId integer NOT NULL references majorgroup(id),
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE checkdetailspecialrequest (
--   id serial primary key,
--   checkDetailId integer NOT NULL references checkdetail(id) ON DELETE CASCADE,
--   specialRequestId int NOT NULL references specialrequest(id)
-- );

-- CREATE TABLE itemoutofstock (
--   id serial primary key,
--   itemId integer UNIQUE NOT NULL references item(id)
-- );

-- CREATE TABLE mealtype (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE menu (
--   id serial primary key,
--   mealTypeId integer NOT NULL references mealtype(id),
--   isDefault boolean not null,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );


-- CREATE TABLE menuitem (
--   id serial primary key,
--   menuId integer NOT NULL references menu(id),
--   itemId integer NOT NULL references item(id),
--   price NUMERIC NOT NULL
-- );

-- CREATE TABLE systemsetting (
--   id serial primary key,
--   restaurantName text NOT NULL,
--   restaurantImage text DEFAULT NULL,
--   address text NOT NULL,
--   taxValue integer NOT NULL
-- );

-- CREATE TABLE "sessions"(
-- 	sid text primary key NOT NULL,
-- 	sess json NOT NULL,
-- 	expired TIMESTAMP without time zone NOT NULL
-- );

-- CREATE TABLE "cashierlog"(
-- 	id serial primary key,
-- 	accountId integer NOT NULL references "account"(id),
-- 	shiftId integer NOT NULL references "shift"(id),
--   	creationTime timestamp without time zone NOT NULL,
--   	updaterId integer DEFAULT NULL,
--   	updateTime timestamp without time zone DEFAULT NULL,
-- 	"type" cashierlog_type NOT NULL default 'OPEN',
-- 	amount NUMERIC NOT NULL
-- );

-- --Basic
-- INSERT INTO role("name") VALUES('ADMIN');
-- INSERT INTO role("name") VALUES('MANAGER');
-- INSERT INTO role("name") VALUES('WAITER');
-- INSERT INTO role("name") VALUES('CASHIER');
-- INSERT INTO role("name") VALUES('KITCHEN_STAFF');

-- --Account
-- --password = 123qwe
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'admin','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Van A','adminwork@gmail.com','0908888721','OFFLINE',(SELECT id FROM role WHERE name = 'ADMIN'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face1.jpg?alt=media&token=8ee476b2-9702-4e74-9b38-7e4be98267fb');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'waiter','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Cao Na','waiterwork@gmail.com','0908888722','OFFLINE',(SELECT id FROM role WHERE name = 'WAITER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face2.jpg?alt=media&token=a9b5cf93-0328-4451-9fee-f3dffd2656c3');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'waiter1','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Cao Ba','waiterwork1@gmail.com','0908888723','OFFLINE',(SELECT id FROM role WHERE name = 'WAITER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face3.jpg?alt=media&token=d7bccc50-a878-405c-b513-20a7781f5755');	
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'cashier','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Tai Ca','cashierwork@gmail.com','0908888724','OFFLINE',(SELECT id FROM role WHERE name = 'CASHIER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face4.jpg?alt=media&token=103f79c3-e4b6-44ba-9547-252850bdf291');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'kitchen','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Thanh Le','kitchenwork@gmail.com','0908888725','OFFLINE',(SELECT id FROM role WHERE name = 'KITCHEN_STAFF'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face5.jpg?alt=media&token=9d2a3f25-28d3-414a-93cf-a5fd3b4ed993');

-- --System settings.
-- INSERT INTO systemsetting(restaurantname,address,taxvalue,restaurantimage) VALUES('Restaurant A','Default Address', 10,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/logo.png?alt=media&token=3abf9469-7d3c-49e7-a2dd-d47dbdb03f37');


-- --Worksession
-- INSERT INTO worksession(workdate,isopen,creatorid,creationtime) 
-- VALUES(CURRENT_DATE,true,(SELECT account.id FROM account JOIN "role" ON account.roleid = role.id WHERE role.name = 'ADMIN'),CURRENT_TIMESTAMP);

-- --Shift
-- -- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- -- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Default shift 1', NOW(),NOW(),true,'ACTIVE');

-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca sáng', '06:00:00','11:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca trưa', '11:00:00','14:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca tối', '14:00:00','22:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca gãy', '22:00:00','23:59:00',false,'ACTIVE');

-- --Location
-- INSERT INTO "location"("name",status) VALUES('Khu vực chính','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Sân ngoài','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu A','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu B','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu C','ACTIVE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF5',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF6',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF7',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name= 'Khu vực chính'  LIMIT 1),'MF8',8,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF9',8,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF10',20,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS5',4,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A' LIMIT 1),'A5',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A6',8,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B' LIMIT 1),'B5',6,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C4',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C' LIMIT 1),'C5',8,'NOT_USE');

-- --Mealtype
-- INSERT INTO mealtype("name",status) VALUES('Bữa sáng','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Bữa trưa','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Bữa tối','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Mọi bữa','ACTIVE');

-- --Majorgroup
-- INSERT INTO majorgroup("name",status) VALUES('Khai vị','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món lẩu','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món nướng','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Tráng miệng','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Nước uống','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món khác','ACTIVE');

-- --Special request
-- --Khai vị
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nhiều tương ớt','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nhiều nước tương','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Thêm mayonnaise','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Không lấy rau ngò ','ACTIVE');

-- --Nươc uống
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Không đá ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nhiều đá ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Đá viên ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Đá nhuyễn','ACTIVE');

-- --Món lẩu
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Truyền Thống','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Kim Chi','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Tomyum','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Trường Thọ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Chua Cay','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Tứ Xuyên','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nhiều nước lẩu','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Phần ớt riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Mỹ tôm để nguyên gói','ACTIVE');

-- --Món nướng
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Không lấy mỡ dầu','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Để mỡ dầu riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Nướng sẵn','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Nhiều hành','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Không hành','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Thêm phần nấm trắng riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Phần sốt riêng','ACTIVE');

-- --Menu and item
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa sáng'  LIMIT 1),false,'Bữa sáng','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa trưa'  LIMIT 1),false,'Bữa trưa','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa tối'  LIMIT 1),false,'Bữa tối','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Mọi bữa'  LIMIT 1),true,'Combo','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Mọi bữa'  LIMIT 1),false,'Món kèm','ACTIVE');

-- --Món Khai vị
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Rau củ tổng hợp','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Rau%20c%E1%BB%A7%20t%C3%B4ng%20h%E1%BB%A3p%2069.jpg?alt=media&token=eeda0a10-073c-4f6d-8a24-1e38405790f2');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Ngô ngọt','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ng%C3%B4%20ng%E1%BB%8Dt.jpg?alt=media&token=6af20cb2-28ac-408e-89e6-9a3288e61dd8');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Đậu bắp nhật','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Dau_Bap_Nhat_20.jpg?alt=media&token=98c1a86f-8328-4f23-9474-59863f94cb3a');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nấm đùi gà nướng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nam_Dui_Ga_Nuong_39.jpg?alt=media&token=8d337102-ea63-484e-b97b-133a4d93dc89');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Kim Chi cải thảo','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kimchi_Cai_Thao_39.jpg?alt=media&token=f5e0c2c1-ec33-4011-8e10-36e5fec746ee');

-- -- món kèm: khác
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Canh bò cay','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/canh_Canh%20b%C3%B2%20cay.jpg?alt=media&token=eed6cb2e-d9ef-4ae2-aba5-5b047bddc717');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Canh sương bò','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/canh%20s%C6%B0%C6%A1ng%20b%C3%B2%2030k.jpg?alt=media&token=4f8cbab4-909f-4d5d-a9ec-2c65368fcb25');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Tôm chiên Tartar','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/T%C3%B4m%20chi%C3%AAn%20s%E1%BB%91t%20Tartar%2089.png?alt=media&token=acdbdadf-e5ed-4e3f-9989-105b328de40b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Bánh Gyoza chiên','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%C3%A1nh%20chi%C3%AAn%20gyoza.png?alt=media&token=12e672c4-dcd3-4ba7-87db-6e09355c76f6');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Nấm tiên','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/N%E1%BA%A5m%20ti%C3%AAn%2020.jpg?alt=media&token=68119e2c-2de5-4b30-ab03-7ade1e465b1f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Nấm linh chi','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/N%E1%BA%A5m%20linh%20chi%2049.jpg?alt=media&token=8bf6e0ac-b32d-4af2-8002-4fa2b16d195c');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Salad','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Salad%2010.jpg?alt=media&token=80ec67a3-7a40-4ebe-9cc1-fb45f7eec7a9');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Sushi cá hổi','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Sushi%20c%C3%A1%20%E1%BB%95i%2039.jpg?alt=media&token=4d742193-9adf-4e1d-820f-057b70c800de');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Toboki hải sản','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Toboki%20h%E1%BA%A3i%20s%E1%BA%A3n%20109.jpg?alt=media&token=927321b8-6e7e-4654-b2d8-ea25de479cea');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Mỳ tôm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/M%C3%AC%20t%C3%B4m%2010.jpg?alt=media&token=5b21fea6-3fac-4a83-bc30-52defdda92fe');

-- -- món khác
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Cơm trộn bò bằm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/C%C6%A1m%20tr%E1%BB%99n%20b%C3%B2%20b%E1%BA%B1m.jpg?alt=media&token=461392c7-1bbc-4918-b35a-4a7b3540fc03');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Cơm rang cá hồi','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/C%C6%A1m%20rang%20c%C3%A1%20h%E1%BB%93i.jpg?alt=media&token=353c4356-69dc-4d54-98ac-f0aca4e619e7');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO cơm sườn bò Mỹ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20c%C6%A1m%20s%C6%B0%E1%BB%9Dng%20b%C3%B2%20m%E1%BB%B9.jpg?alt=media&token=bee1005f-fa55-45f7-bf9d-1aca55b74af1');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO mực sốt gừng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20c%C6%A1m%20m%E1%BB%B1c%20s%E1%BB%91t%20g%E1%BB%ABng.jpg?alt=media&token=445b7908-8398-445a-b04b-e87f73c21b95');


-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Trái cây theo mùa','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Trai%20cay%20theo%20mua%2049k.png?alt=media&token=7ce04d1e-5210-4564-8e52-298bab13fd39');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem chocolate','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20chocola.jpg?alt=media&token=758f77c3-9412-4081-b1db-e593804a482e');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem vani','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20vani.jpg?alt=media&token=880ceffe-54f7-449a-b029-13eb792bdc41');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem dâu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20dau.jpg?alt=media&token=5ce3071c-6670-46db-a3a6-fb65351e4f96');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem khoai môn','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem_Khoai_Mon.jpg?alt=media&token=cc6b5636-0eb9-4049-bc8d-7eb9168ef08a');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Chè khúc bạch','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ch%C3%A8%20kh%C3%BAc%20b%E1%BA%A1ch.jpg?alt=media&token=d6c28cdd-faf8-495d-a543-815a4ccb72f8');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Trà và bánh bạc hà','ACTIVE',
-- 												 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Tr%C3%A1ng%20mi%E1%BB%87ng%20tr%C3%A0%20v%C3%A0%20b%C3%A1nh%20b%E1%BA%A1c%20h%C3%A0%2059.PNG?alt=media&token=ddbd2d1f-1d00-4fbc-ae8c-d4917be2cb63');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Uyên Ương Lẩu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Uy%C3%AAn%20%C6%AF%C6%A1ng%20L%E1%BA%A9u%20225%20.PNG?alt=media&token=fb816df0-b7fd-4b68-8445-7b65d4ca38de');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu Nhúng bò Mỹ','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20nh%C3%BAng%20b%C3%B2%20m%E1%BB%B9%20150.PNG?alt=media&token=37b3f9f3-ecc4-4367-8633-30dd5e22f516');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu rau HongKong','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20rau%20hongkong%20150.PNG?alt=media&token=eda745a6-b128-4d99-83f1-1cb5a3e1ec29');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu rau nấm tổng hợp','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Rau_Nam_Tong_Hop_Kem_Lau_59.jpg?alt=media&token=41d0db3d-fc79-484d-9301-503c4cca3314');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu mực nhỏ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/lau%20muc%20nh%E1%BB%8F.png?alt=media&token=fcdb5a7c-016f-4ebf-a736-2a45ac8eb797');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu Miso Kim Chi','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/lau%20miso%20kimchi.jpg?alt=media&token=95f19f37-aff5-412d-a88f-345768ecab1f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bò angus','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/bo-angus%20109.jpg?alt=media&token=f27ac675-4d45-40d6-a47f-7ced1bd18c2f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn non obothan','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/S%C6%B0%E1%BB%9Dn%20non%20obathan%20209.jpg?alt=media&token=2d6d0067-f26a-4c45-ad22-934faffd0dfe');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn gali','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/s%C6%B0%E1%BB%9Dn%20Galbi_109.jpg?alt=media&token=eba8a5d1-1d6d-4bcf-9dbf-6556af28d6f1');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn mật ong','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/s%C6%B0%E1%BB%9Dn%20m%E1%BA%ADt%20ong%20109.jpg?alt=media&token=1b24e85d-b5d8-41df-9cd7-576c28c5f3f0');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bò và heo thượng hạng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%C3%B2%20v%C3%A0%20heo%20th%C6%B0%E1%BB%A3ng%20h%E1%BA%A1ng.jpg?alt=media&token=08f7cebf-01b2-4105-996d-b2707d71cfcb');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Má heo tươi tryền thống','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/ma%20heo%20t%C6%B0%C6%A1i%20truy%E1%BB%81n%20th%E1%BB%91ng.jpg?alt=media&token=08fedcac-7ea1-45af-a26b-e9f9b3847a6e');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Heo nạt phủ sốt đậu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Heo%20n%E1%BA%A1t%20ph%E1%BB%A7%20s%E1%BB%91t%20%C4%91%E1%BA%ADu.jpg?alt=media&token=7c551761-6bc8-4ce5-a7fc-d780a83555a4');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bụng bò đơn','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%E1%BB%A5ng%20b%C3%B2%20t%C6%B0%E1%BB%9Di%20%C4%91%C6%A1n%2040.jpg?alt=media&token=78a6c93a-1ddc-40b6-9e10-a115c7d441fb');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Tôm nướng (10 xiên)','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%E1%BB%A5ng%20b%C3%B2%20t%C6%B0%E1%BB%9Di%20%C4%91%C6%A1n%2040.jpg?alt=media&token=78a6c93a-1ddc-40b6-9e10-a115c7d441fb');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu thái thập cẩm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20l%E1%BA%A9u%20th%C3%A1i%20th%E1%BA%ADp%20c%E1%BA%A9m%20399.png?alt=media&token=3167d80d-906f-44c4-bbdb-485c3a778847');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu thái bò sụn','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20th%C3%A1i%20b%C3%B2%20s%E1%BB%A5n-6-10.%20790png.png?alt=media&token=802f50b9-4a8c-4ff8-b8a7-5980b99d3b83');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu riêu ba chỉ bò Mỹ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20ri%C3%AAu-ba-ch%E1%BB%89-b%C3%B2-m%E1%BB%B9-ss-4-6ng%20590.png?alt=media&token=997ac8e7-9473-4440-9071-656560c6f978');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO Kim Chi hải sản','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20kim%20chi%20h%E1%BA%A3i%20s%E1%BA%A3n%20490.png?alt=media&token=de31a797-d6d2-4f85-a4d8-a512e8be9407');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'COMBO bò nướng cổ điển','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20b%C3%B2%20n%C6%B0%E1%BB%9Bng%20c%E1%BB%95%20%C4%91i%E1%BB%83n%20199.PNG?alt=media&token=873e9307-7f6b-4423-96c9-9ed9e6bffd0b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'COMBO nướng thượng hàng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/combo%20n%C6%B0%E1%BB%9Bng%20h%C6%B0%E1%BB%A3ng%20h%E1%BA%A1ng%20590.jpg?alt=media&token=a046023e-b165-486f-ad91-14cd6649f61d');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'COMBO kem ly Hàn Quốc','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20kem%20tr%C3%A1ng%20mi%E1%BB%87ng%203%20ng%C6%B0%E1%BB%9Di%20HQ%20180.PNG?alt=media&token=0559be34-49ff-4568-96e5-49eff2f56016');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'COMBO bánh kem mini Hàn Quốc','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20b%C3%A1nh%20mini%20259.PNG?alt=media&token=86730379-754b-425d-8293-667d8fa38f9d');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO thịt bò và tôm mini','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/COMBO%20khai%20v%E1%BB%8B%20th%E1%BB%8Bt%20b%C3%B2%20v%C3%A0%20t%C3%B4m%20mini%20.PNG?alt=media&token=7204f96b-b5d6-427c-b35c-a268e80abbef');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu hải sản 1 người','ACTIVE', 
-- 														 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/COMBO%20l%E1%BA%A9u%201%20h%E1%BA%A3i%20s%E1%BA%A3n%201%20ng%C6%B0%E1%BB%9Di.jpg?alt=media&token=b1b856ee-c8ba-4878-b8d8-ee685d3c516f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước Dasani','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nuoc%20dasani.jpg?alt=media&token=46f2752e-f299-4aa6-af29-64ed2b047d95');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ngọt Fanta','ACTIVE'
-- 														,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Fanta.png?alt=media&token=3f269e2d-ad79-46a5-9ce6-5f7efc41adb8');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ngọt soda chanh đường','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Soda_Chanh_Duong_1_3.jpg?alt=media&token=66658f70-3da8-402e-a4d5-97d64309c135');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ép tropical bạc hà','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Tropical_Teapot_Vi_Bac_Ha_1_1.jpg?alt=media&token=bad566eb-0470-40ba-9a08-18a8e8a5d4a9');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ép dưa hấu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nuoc_Ep_Dua_Hau_1_1.jpg?alt=media&token=3e51106b-994d-460b-8330-91c8ed86cace');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Strong Bow Golden Apple','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Strongbow_Gold_Apple_1_1.jpg?alt=media&token=3dd64c2e-fc86-4adc-bd13-61dd2473d60a');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Tiger Crystal','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Tiger%20Crystal.jpg?alt=media&token=398c3aae-fa66-48af-8508-df510ceb4e23');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Tiger','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Tiger.jpg?alt=media&token=31f2aaa5-a9a2-4d27-acac-c79474459e15');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Heineken','ACTIVE'
-- 														,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Heineken.jpg?alt=media&token=a1a443de-dc63-4c33-ac56-97815e992850');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Rượu vang đỏ Vina Maipo','ACTIVE'
-- 													   ,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ruou_Vang_Do_Vina_Maipo_Cabernet_Sauvignon_1_1.jpg?alt=media&token=78314c16-3320-483c-b441-e4aea0447978');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Rượu vang trắng Legende','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/R%E1%BB%B1u%20Vang%20Tr%E1%BA%AFng%20Legende.jpg?alt=media&token=d1d2762c-f21d-4b3d-8274-1d4bad41390b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Xiêng xông khói','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/xi%C3%AAng%20x%C3%B4ng%20kh%C3%B3i.PNG?alt=media&token=714b4aa7-a7ad-4a0e-84ba-01cd1d36d005');

-- --Menu item bữa sáng
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 12000);
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);
-- --Món nướng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 49000);												 
-- -- Tráng miệng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Chè khúc bạch' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),39000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trà và bánh bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);	
-- --Nước uống
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);		

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);

-- --Món khác										 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);

-- --Menu item bữa trưa
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Đậu bắp nhật' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm đùi gà nướng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Nhúng bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Miso Kim Chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);
-- --Món nướng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn gali' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn mật ong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),69000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 49000);													 
-- --Tráng miệng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trái cây theo mùa' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
																						 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem dâu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem khoai môn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);
-- --Nước uống												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép tropical bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép dưa hấu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger Crystal' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);
-- --Món khác
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- --Menu item bữa tối
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Đậu bắp nhật' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm đùi gà nướng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kim Chi cải thảo' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);											 												 												
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Nhúng bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Miso Kim Chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);
												 
-- --Món nướng												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn gali' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn mật ong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),69000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò và heo thượng hạng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 109000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Má heo tươi tryền thống' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 49000);	
-- --Tráng miệng												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trái cây theo mùa' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
																						 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem dâu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem khoai môn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Chè khúc bạch' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),39000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trà và bánh bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);												 
-- --Nước uống												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép tropical bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 39000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép dưa hấu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger Crystal' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rượu vang đỏ Vina Maipo' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 799000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rượu vang trắng Legende' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 899000);

-- --Món khác
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);			

-- --Món kèm
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Canh bò cay' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 39000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Canh sương bò' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 39000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Tôm chiên Tartar' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bánh Gyoza chiên' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 19000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sushi cá hổi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm linh chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 35000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm tiên' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 25000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Salad' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Mỳ tôm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 3000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Toboki hải sản' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 19000);
												 
												 												 												 
-- --Combo													 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu thái thập cẩm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 399000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu thái bò sụn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 799000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu riêu ba chỉ bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 599000);												 
												 											 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO Kim Chi hải sản' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 499000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO nướng thượng hàng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1),699000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO kem ly Hàn Quốc' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1),189000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO bánh kem mini Hàn Quốc' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 209000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO thịt bò và tôm mini' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu hải sản 1 người' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 99000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO cơm sườn bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 189000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO mực sốt gừng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 189000);												 
												 
-- --voidreason
-- INSERT INTO voidreason("name",status) VALUES('Khách hủy món','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Lỗi nhân viên','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Lỗi hệ thống','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Hết hàng','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Nhầm món ăn hoặc số lượng','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Chuyển món sai','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Món không theo yêu cầu khách','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Nguyên nhân khác','ACTIVE');

-- INSERT INTO paymentmethod("name",status) VALUES('Tiền mặt','ACTIVE');
-- INSERT INTO paymentmethod("name",status) VALUES('MoMo','ACTIVE');
-- INSERT INTO paymentmethod("name",status) VALUES('Séc ngân hàng','ACTIVE');


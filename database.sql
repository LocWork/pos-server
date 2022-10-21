DROP DATABASE IF EXISTS restaurant;

 CREATE DATABASE restaurant
     WITH
     OWNER = postgres
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.utf8'
     LC_CTYPE = 'en_US.utf8'
     TABLESPACE = pg_default
     CONNECTION LIMIT = -1
	 TEMPLATE template0
     IS_TEMPLATE = False;

Create TYPE basic_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE user_status AS ENUM ('ONLINE', 'OFFLINE', 'INACTIVE');
CREATE TYPE table_status AS ENUM ('NOT_USE', 'IN_USE', 'INACTIVE');
CREATE TYPE	check_status AS ENUM ('ACTIVE', 'CLOSED', 'VOID');
CREATE TYPE	checkdetail_status AS ENUM ('WAITING', 'READY', 'SERVED','RECALL', 'VOID');
Create TYPE bill_status AS ENUM ('CLOSED','REFUND');

CREATE TABLE role (
	id serial primary key,
	name text UNIQUE not null
);
	
CREATE TABLE account (
  id serial primary key,
  username text unique NOT NULL,
  password text NOT NULL,
  fullName text NOT NULL,
  avatar text DEFAULT NULL,
  email text unique NOT NULL,
  phone text unique NOT NULL,
  status user_status default 'OFFLINE',
  roleId integer NOT NULL references role(id)
);

CREATE TABLE worksession (
  id serial primary key,
  workDate date NOT NULL,
  isOpen boolean NOT NULL,
  creatorId integer NOT NULL,
  creationTime timestamp with time zone NOT NULL,
  updaterId integer DEFAULT NULL,
  updateTime timestamp with time zone DEFAULT NULL
);

CREATE TABLE voidreason (
  id serial primary key,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE location (
  id serial primary key,
  name text NOT NULL,
  status basic_status default 'ACTIVE'
);

CREATE TABLE shift (
  id serial primary key,
  workSessionId integer NOT NULL references worksession(id),
  name text NOT NULL,
  startTime time NOT NULL,
  endTime time NOT NULL,
  openerId integer DEFAULT NULL,
  closerId integer DEFAULT NULL,
  isOpen boolean NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE "table" (
  id serial primary key,
  locationId integer NOT NULL references location(id),
  name text NOT NULL,
  seat integer NOT NULL,
  status table_status NOT NULL default 'NOT_USE'
);

CREATE TABLE "check" (
  id serial primary key,
  shiftId integer NOT NULL references shift(id),
  accountId integer NOT NULL references account(id),
  tableId int NOT NULL references "table"(id),
  voidReasonId int DEFAULT NULL references voidreason(id),
  checkNo text UNIQUE NOT NULL,
  guestName text DEFAULT NULL,
  cover integer DEFAULT NULL,
  subtotal integer NOT NULL,
  totalTax integer NOT NULL,
  totalAmount integer NOT NULL,
  note text DEFAULT NULL,
  creatorId integer NOT NULL,
  creationTime timestamp with time zone NOT NULL,
  updaterId integer DEFAULT NULL,
  updateTime timestamp with time zone DEFAULT NULL,
  runningSince timestamp with time zone NOT NULL
  status check_status NOT NULL default 'ACTIVE'
);

ALTER TABLE "check"
ADD COLUMN runningSince timestamp with time zone DEFAULT NULL;

CREATE TABLE bill (
  id serial primary key,
  checkId integer NOT NULL references "check"(id),
  billNo text unique NOT NULL,
  guestName text DEFAULT NULL,
  subtotal integer NOT NULL,
  totalTax integer NOT NULL,
  totalAmount integer NOT NULL,
  note text DEFAULT NULL,
  creatorId integer NOT NULL,
  creationTime timestamp with time zone NOT NULL,
  updaterId integer DEFAULT NULL,
  updateTime timestamp with time zone DEFAULT NULL,
  status bill_status NOT NULL default 'CLOSED'
);

CREATE TABLE majorgroup (
  id serial primary key,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE item (
  id serial primary key,
  majorGroupId integer NOT NULL references majorgroup(id),
  image text DEFAULT NULL,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE billdetail (
  id serial primary key,
  billId integer not null references bill(id),
  itemId integer NOT NULL references item(id),
  itemName text NOT NULL,
  itemPrice integer NOT NULL,
  quantity float8 NOT NULL,
  subtotal integer NOT NULL,
  taxAmount integer NOT NULL,
  amount integer NOT NULL
);

CREATE TABLE paymentmethod (
  id serial primary key,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE billpayment (
  id serial primary key,
  billId integer not null references bill(id),
  paymentMethodId int NOT NULL references paymentmethod(id),
  paymentMethodName text NOT NULL,
  amountReceive integer NOT NULL
);

CREATE TABLE checkdetail (
  id serial primary key,
  checkId integer NOT NULL references "check"(id) ON DELETE CASCADE,
  itemId integer NOT NULL references item(id),
  voidReasonId int DEFAULT NULL references voidreason(id),
  itemPrice integer NOT NULL,
  quantity float8 NOT NULL,
  subtotal integer NOT NULL,
  taxAmount integer NOT NULL,
  amount integer NOT NULL,
  note text DEFAULT NULL,
  isReminded boolean NOT NULL,
  status checkdetail_status NOT NULL default 'WAITING',
  completionTime time with time zone default NULL
);

CREATE TABLE specialrequest (
  id serial primary key,
  majorGroupId integer NOT NULL references majorgroup(id),
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE checkdetailspecialrequest (
  id serial primary key,
  checkDetailId integer NOT NULL references checkdetail(id) ON DELETE CASCADE,
  specialRequestId int NOT NULL references specialrequest(id)
);

CREATE TABLE itemoutofstock (
  id serial primary key,
  itemId integer UNIQUE NOT NULL references item(id)
);

CREATE TABLE mealtype (
  id serial primary key,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);

CREATE TABLE menu (
  id serial primary key,
  mealTypeId integer NOT NULL references mealtype(id),
  isDefault boolean not null,
  name text NOT NULL,
  status basic_status NOT NULL default 'ACTIVE'
);


CREATE TABLE menuitem (
  id serial primary key,
  menuId integer NOT NULL references menu(id),
  itemId integer NOT NULL references item(id),
  price integer NOT NULL
);

CREATE TABLE systemsetting (
  id serial primary key,
  restaurantName text NOT NULL,
  restaurantImage text DEFAULT NULL,
  address text NOT NULL,
  taxValue integer NOT NULL
);

CREATE TABLE "sessions"(
	sid text primary key NOT NULL,
	sess json NOT NULL,
	expired TIMESTAMP with time zone NOT NULL
);

--Basic
INSERT INTO role("name") VALUES('ADMIN');
INSERT INTO role("name") VALUES('MANAGER');
INSERT INTO role("name") VALUES('WAITER');
INSERT INTO role("name") VALUES('CASHIER');
INSERT INTO role("name") VALUES('KITCHEN_STAFF');
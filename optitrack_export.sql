--
-- PostgreSQL database dump
--

\restrict PjCfsoJiZNHfsoEb9yP79e2dwoIzfgz27GNhvZUK2oeOuyWPSL4oLq7JPtlIWod

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    manufacturer_id character varying NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: clinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    clinic_name text NOT NULL,
    address text,
    city text,
    state text,
    zip text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clinics OWNER TO postgres;

--
-- Name: frame_holds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frame_holds (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    clinic_id character varying,
    frame_id character varying,
    frame_name text NOT NULL,
    brand text NOT NULL,
    account_number text NOT NULL,
    hold_start_date text NOT NULL,
    hold_expiration_date text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.frame_holds OWNER TO postgres;

--
-- Name: frames; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frames (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    manufacturer text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    color text NOT NULL,
    eye_size integer NOT NULL,
    bridge integer NOT NULL,
    temple_length integer NOT NULL,
    cost numeric(10,2) NOT NULL,
    retail_price numeric(10,2) NOT NULL,
    status text DEFAULT 'on_board'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    barcode text,
    lab_order_number text,
    lab_name text,
    tracking_number text,
    lab_account_number text,
    date_sent_to_lab text,
    multiplier numeric(10,4),
    vision_plan text,
    date_received_from_lab text,
    date_sold text,
    clinic_id character varying,
    quantity integer DEFAULT 1 NOT NULL,
    sold_count integer DEFAULT 0 NOT NULL,
    off_board_qty integer DEFAULT 0 NOT NULL,
    reorder_count integer DEFAULT 0 NOT NULL,
    code text,
    reordered_qty integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.frames OWNER TO postgres;

--
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    clinic_id character varying,
    frame_id character varying,
    frame_brand text NOT NULL,
    frame_model text NOT NULL,
    frame_color text NOT NULL,
    frame_manufacturer text NOT NULL,
    vision_plan text,
    lab_name text,
    lab_order_number text,
    lab_account_number text,
    tracking_number text,
    date_sent_to_lab text,
    date_received_from_lab text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    frame_sold boolean DEFAULT false NOT NULL,
    frame_sold_at text,
    patient_own_frame boolean DEFAULT false NOT NULL,
    notes text,
    custom_due_date text
);


ALTER TABLE public.lab_orders OWNER TO postgres;

--
-- Name: labs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    account text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    clinic_id character varying
);


ALTER TABLE public.labs OWNER TO postgres;

--
-- Name: manufacturers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manufacturers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.manufacturers OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text,
    role text DEFAULT 'staff'::text NOT NULL,
    invite_token text,
    invite_expiry timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    clinic_id character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: weekly_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_metrics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    week_starting text NOT NULL,
    total_comprehensive_exams integer NOT NULL,
    follow_ups integer NOT NULL,
    total_optical_orders integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    clinic_id character varying,
    daily_data text
);


ALTER TABLE public.weekly_metrics OWNER TO postgres;

--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, manufacturer_id, name, created_at) FROM stdin;
f0c2cbcc-575f-4c57-8558-11d15ffdbc03	711b6e0d-a0a4-4690-9687-d458740f2016	Ray-Ban	2026-03-06 10:24:12.041383
3fe59753-2485-4afa-a06e-821c31f10e6b	711b6e0d-a0a4-4690-9687-d458740f2016	Oakley	2026-03-06 10:24:12.100269
ab2e7e0c-96c4-46c3-ad0c-2459c865e6e7	711b6e0d-a0a4-4690-9687-d458740f2016	Persol	2026-03-06 10:24:12.144526
5628f3ac-9cc4-432b-853e-5a3aefe657b5	711b6e0d-a0a4-4690-9687-d458740f2016	Oliver Peoples	2026-03-06 10:24:12.188879
cfd7b6f3-e3a1-4e41-b0c0-a89618cec2a9	711b6e0d-a0a4-4690-9687-d458740f2016	Alain Mikli	2026-03-06 10:24:12.233288
1d124ad8-5f59-472f-b493-a739d93f85fc	711b6e0d-a0a4-4690-9687-d458740f2016	Arnette	2026-03-06 10:24:12.277776
d0d6daa1-1fb0-4a0a-a31a-10c70ba00903	711b6e0d-a0a4-4690-9687-d458740f2016	Vogue Eyewear	2026-03-06 10:24:12.321851
36139797-cd1c-4b4d-897b-2e4bbad7d098	711b6e0d-a0a4-4690-9687-d458740f2016	Tiffany & Co	2026-03-06 10:24:12.366101
ff52ceca-9093-4bf6-8a09-a7665bbc5a74	711b6e0d-a0a4-4690-9687-d458740f2016	Giorgio Armani	2026-03-06 10:24:12.410036
19fd0896-6552-4abe-a473-e50a0d735b5c	711b6e0d-a0a4-4690-9687-d458740f2016	Emporio Armani	2026-03-06 10:24:12.454818
612ad9f0-d8c8-47e6-ade7-4edfcde69721	711b6e0d-a0a4-4690-9687-d458740f2016	Armani Exchange	2026-03-06 10:24:12.499321
35efb430-7b52-4519-9cc4-55e0cb6607db	711b6e0d-a0a4-4690-9687-d458740f2016	Burberry	2026-03-06 10:24:12.543341
851fcc9f-606d-420d-8228-814cb29b81cb	711b6e0d-a0a4-4690-9687-d458740f2016	Prada	2026-03-06 10:24:12.587312
01dff94f-a247-4820-9a3b-ecd9a2a51ea9	711b6e0d-a0a4-4690-9687-d458740f2016	Prada Linea Rossa	2026-03-06 10:24:12.631433
54d5d4c1-1a47-4bdf-b932-c9b7b0544218	711b6e0d-a0a4-4690-9687-d458740f2016	Dolce & Gabbana	2026-03-06 10:24:12.677712
b0c3f287-579e-49c3-8f67-1d74f60a870a	711b6e0d-a0a4-4690-9687-d458740f2016	Versace	2026-03-06 10:24:12.73426
5197fc46-204c-4803-8332-2f0c27b80d16	711b6e0d-a0a4-4690-9687-d458740f2016	Michael Kors	2026-03-06 10:24:12.778266
e01aa1a8-aa40-470d-bf0c-8c0747f17dba	711b6e0d-a0a4-4690-9687-d458740f2016	Coach	2026-03-06 10:24:12.822357
839c537b-28ac-4a0f-9dc1-d78cf96e3c46	711b6e0d-a0a4-4690-9687-d458740f2016	Tory Burch	2026-03-06 10:24:12.86642
f24fd031-2797-4864-9895-a5379b898b41	711b6e0d-a0a4-4690-9687-d458740f2016	Swarovski	2026-03-06 10:24:12.910398
41ee921a-207f-4bb5-ac93-555b2c09d0c9	711b6e0d-a0a4-4690-9687-d458740f2016	Jimmy Choo	2026-03-06 10:24:12.954313
17b873c4-fedd-4a96-be4f-3053d0280742	711b6e0d-a0a4-4690-9687-d458740f2016	Brooks Brothers	2026-03-06 10:24:12.998521
91e19cdd-2b82-4d20-87ab-660316e09c88	711b6e0d-a0a4-4690-9687-d458740f2016	Ralph Lauren	2026-03-06 10:24:13.042776
bedfe1f0-4108-46d9-868a-5a56e0cfdbdc	711b6e0d-a0a4-4690-9687-d458740f2016	Polo Ralph Lauren	2026-03-06 10:24:13.087319
9e2cb210-f975-4928-b3c3-4aaaa1cd5b42	711b6e0d-a0a4-4690-9687-d458740f2016	Ferragamo	2026-03-06 10:24:13.131454
416c652c-681b-4467-98d2-f69b8e603229	711b6e0d-a0a4-4690-9687-d458740f2016	Bulgari	2026-03-06 10:24:13.175993
b83cbe20-5dd1-4939-89a5-1d7f9f0939bd	d3e41287-ad15-4d7a-b210-e17cff52742b	Nike	2026-03-06 10:24:13.264821
68e8a81a-4123-4179-a136-b9b850a65dc4	d3e41287-ad15-4d7a-b210-e17cff52742b	Calvin Klein	2026-03-06 10:24:13.308743
ec1d8235-c3e9-478e-bb22-35899dde31ba	d3e41287-ad15-4d7a-b210-e17cff52742b	Calvin Klein Jeans	2026-03-06 10:24:13.353035
7a800100-f3af-4745-809e-4c770a74ed5b	d3e41287-ad15-4d7a-b210-e17cff52742b	Lacoste	2026-03-06 10:24:13.397099
98840d41-23b4-4168-995b-19ebe9078bf7	d3e41287-ad15-4d7a-b210-e17cff52742b	Dragon	2026-03-06 10:24:13.441929
b1a238ed-65db-4d5e-bc2e-2f889b283a78	d3e41287-ad15-4d7a-b210-e17cff52742b	Flexon	2026-03-06 10:24:13.486016
f967091a-a9fd-428d-a1f3-77d28bd7899f	d3e41287-ad15-4d7a-b210-e17cff52742b	Skaga	2026-03-06 10:24:13.530029
559793ba-9c39-4b25-b84d-2654eb982493	d3e41287-ad15-4d7a-b210-e17cff52742b	Nine West	2026-03-06 10:24:13.574417
ba5c1f54-7424-4eed-8c6d-9e283725ed60	d3e41287-ad15-4d7a-b210-e17cff52742b	Marchon NYC	2026-03-06 10:24:13.618477
390da72c-1c8c-43b4-9acb-4af0a69cc7c4	d3e41287-ad15-4d7a-b210-e17cff52742b	Longchamp	2026-03-06 10:24:13.662849
9d131db0-6ee0-4229-9d41-be3c3701ca16	d3e41287-ad15-4d7a-b210-e17cff52742b	Victoria Beckham	2026-03-06 10:24:13.707735
d1c035ed-f736-49f8-8c5f-d34c52e9c0ce	d3e41287-ad15-4d7a-b210-e17cff52742b	Karl Lagerfeld	2026-03-06 10:24:13.752154
f7604beb-d433-41fd-9c56-c78047435d3d	d3e41287-ad15-4d7a-b210-e17cff52742b	Converse	2026-03-06 10:24:13.797119
85be3935-aae8-45a3-bcaf-92c9677f4779	d3e41287-ad15-4d7a-b210-e17cff52742b	Liu Jo	2026-03-06 10:24:13.841303
b4842a5f-9241-4910-bc8c-0705094dc235	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Carrera	2026-03-06 10:24:13.9297
1a618b89-1133-4c66-89fa-869799d160c7	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Polaroid	2026-03-06 10:24:13.97413
d45aefe3-0d70-43a2-8491-22da446424dc	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Boss	2026-03-06 10:24:14.018255
12c176fa-17dd-4cbb-acce-31096e1dd41f	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Hugo	2026-03-06 10:24:14.062958
7250553a-abda-4f27-8f3c-778d7f2d8151	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Kate Spade	2026-03-06 10:24:14.107578
9dc48562-5cd6-46bc-826b-e5877c5f476e	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Tommy Hilfiger	2026-03-06 10:24:14.151811
309a66c9-32f2-451c-8c7e-366483a1211c	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Marc Jacobs	2026-03-06 10:24:14.195794
9896934b-99bb-4f56-b3d3-8ed32c476446	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	David Beckham	2026-03-06 10:24:14.239869
44f865a2-56ca-4c17-af04-d5685c1d4d72	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Dsquared2	2026-03-06 10:24:14.284555
4c12818f-ef25-4a7f-87de-777648aaeb86	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Moschino	2026-03-06 10:24:14.3289
75fb33da-6ad6-4140-98f0-90f9487c5811	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Missoni	2026-03-06 10:24:14.373263
9bda7381-b7fb-4c54-9a1f-09a7f6d7d121	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Under Armour	2026-03-06 10:24:14.419685
86eeb7ea-5ac1-478e-aeab-3b072ae59277	ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Levi's	2026-03-06 10:24:14.464143
dc462b61-43ef-4c5c-95ae-4365f226d498	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Gucci	2026-03-06 10:24:14.553313
9f06be9d-75dd-4c98-aa78-73986a415266	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Saint Laurent	2026-03-06 10:24:14.59761
2263194f-ec08-4a74-b562-8614a7e591c1	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Balenciaga	2026-03-06 10:24:14.642147
e8ae86b0-0c3c-4710-ace5-b0347004bdac	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Bottega Veneta	2026-03-06 10:24:14.686395
bf3dceff-f6c4-4f77-9f2b-78849b942219	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Alexander McQueen	2026-03-06 10:24:14.73046
df19b9ac-13b4-4b76-b3b5-00300f4c935e	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Cartier	2026-03-06 10:24:14.774351
414e36a8-701a-4abb-b435-73f94c54a5ae	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Chloé	2026-03-06 10:24:14.819022
d0a84d71-a4b3-4b36-b6cc-419bec207c97	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Dunhill	2026-03-06 10:24:14.864946
022b0978-b126-4766-a807-9003ba2420ae	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Montblanc	2026-03-06 10:24:14.909356
0bc28c4c-41ef-4616-bf77-9ccbdfb1bcb4	aa4342e2-9df5-474e-8ba2-3d7ae512f133	Puma	2026-03-06 10:24:14.953566
6075f08a-938b-4a2f-973d-fca72d49dba7	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Tom Ford	2026-03-06 10:24:15.042166
8441237e-ed3d-408e-a98a-09622609b015	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Guess	2026-03-06 10:24:15.08683
59a923ab-bbb5-40b6-ab17-9ef206aa39c9	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Adidas Sport	2026-03-06 10:24:15.130918
0dc86512-ef72-4735-877a-888e02e316ba	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Adidas Originals	2026-03-06 10:24:15.176298
1cb97388-6fe0-480e-9705-0fbce323f28c	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Max Mara	2026-03-06 10:24:15.220355
e384dfc4-694b-4e6f-ab13-c1dd78312659	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Zegna	2026-03-06 10:24:15.264313
d31e31c8-85a7-4bc7-a9cc-f7d6619ce0ef	9adbcabb-4cfc-4dc7-8f82-040dc294301e	MCM	2026-03-06 10:24:15.308435
87ca6dff-a199-4c81-9a61-543a4335d735	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Timberland	2026-03-06 10:24:15.35225
db2b539b-81d9-4912-ac2c-a4af6edc394a	9adbcabb-4cfc-4dc7-8f82-040dc294301e	Skechers	2026-03-06 10:24:15.396152
24956a45-8c2b-449e-8cb5-30e737e3af16	11357851-a83c-46a4-91f2-a7e749aed318	Lilly Pulitzer	2026-03-06 10:24:15.487847
5f6ddf17-d3af-4f9c-b978-4a84dec69b8a	11357851-a83c-46a4-91f2-a7e749aed318	Original Penguin	2026-03-06 10:24:15.531869
96ed018c-369a-427a-bb48-0abed0294fd8	11357851-a83c-46a4-91f2-a7e749aed318	Zac Posen	2026-03-06 10:24:15.575924
21d841ff-df6e-4df2-87cc-bf612ec0d443	11357851-a83c-46a4-91f2-a7e749aed318	Vera Wang	2026-03-06 10:24:15.619915
9f28e860-6c03-4669-8f92-fcc18a8b15e8	11357851-a83c-46a4-91f2-a7e749aed318	Nicole Miller	2026-03-06 10:24:15.708292
ee221ce5-6eda-4e62-9868-a2c25631742c	11357851-a83c-46a4-91f2-a7e749aed318	Ted Baker	2026-03-06 10:24:15.752199
1a2b2a9d-6924-4df7-a5d7-7a324d00eb1c	e378687b-0e78-4018-bfff-eb28f629aaee	Silhouette	2026-03-06 10:24:15.839884
8c4c00d4-41b3-404f-a36b-39ef0f874675	e378687b-0e78-4018-bfff-eb28f629aaee	adidas eyewear	2026-03-06 10:24:15.883747
842dbbf3-db46-441e-ad74-7afb864de048	df4cef88-9f0e-44f0-9942-a270f709e62e	Police	2026-03-06 10:24:15.977863
97f66e40-be16-45c7-83b2-01f5a49f458f	df4cef88-9f0e-44f0-9942-a270f709e62e	Lozza	2026-03-06 10:24:16.043334
c646051a-9c68-4fc6-a381-e71cf106c7e7	df4cef88-9f0e-44f0-9942-a270f709e62e	Sting	2026-03-06 10:24:16.102554
cd8f5933-1654-4c81-b8c9-ec289cf9db28	df4cef88-9f0e-44f0-9942-a270f709e62e	Chopard	2026-03-06 10:24:16.167725
254013fe-e74c-4ea4-918a-3fcf58570f68	062d954b-08f3-406e-95ac-564e226fac49	Charmant	2026-03-06 10:24:16.268632
c9e67da8-0c75-478d-ae80-f74e464f252f	062d954b-08f3-406e-95ac-564e226fac49	Line Art	2026-03-06 10:24:16.312522
2e686725-1ebb-4e2b-8f62-bbf9945c62cb	062d954b-08f3-406e-95ac-564e226fac49	Eschenbach	2026-03-06 10:24:16.35632
2471466f-d70d-498b-bb29-cf6774c41b72	2a9aeb1f-aef8-47c1-8bed-07d025b4d192	Revo	2026-03-06 10:24:16.444914
b66928be-6f95-46a8-9cbb-153353100796	2a9aeb1f-aef8-47c1-8bed-07d025b4d192	BCBGMAXAZRIA	2026-03-06 10:24:16.488779
a04629be-8b60-4dfb-8c11-5f76eb1b052f	2a9aeb1f-aef8-47c1-8bed-07d025b4d192	Joseph Abboud	2026-03-06 10:24:16.532951
c697616c-5022-45fe-b703-693d7dd090cf	2a9aeb1f-aef8-47c1-8bed-07d025b4d192	Adidas Originals	2026-03-06 10:24:16.577309
eb84227b-a38d-4682-afbf-f46424ac5234	bbf25f86-5483-440e-950b-cf3542d83965	Blackfin	2026-03-06 10:24:16.665599
00fdf5db-081e-476b-8535-76be7ae6e0d2	bbf25f86-5483-440e-950b-cf3542d83965	Blackfin Titanium	2026-03-06 10:24:16.709518
7710ed93-a19b-4522-a25b-9bd2f89b742f	2a9aeb1f-aef8-47c1-8bed-07d025b4d192	BEBE	2026-03-06 11:09:51.240409
c465a9be-cf66-4aa2-ac75-6268e4a3ce00	7a7096c9-05ac-4ae9-857b-475682c25ce4	Vision Source Frame	2026-03-06 21:46:29.320007
\.


--
-- Data for Name: clinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinics (id, clinic_name, address, city, state, zip, created_at) FROM stdin;
438b0785-980d-4e7f-8efd-e4546d58dbf6	Yukon Eyecare Professionals	123 Example Street				2026-03-06 18:26:06.614001
\.


--
-- Data for Name: frame_holds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frame_holds (id, clinic_id, frame_id, frame_name, brand, account_number, hold_start_date, hold_expiration_date, status, notes, created_at) FROM stdin;
abd39de7-edf8-44af-bf3b-ab9db8956da5	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	TestModel99	TestBrand	ACC-0000	2026-03-11	2026-03-25	active		2026-03-11 08:16:51.747969
1e90126b-ac2e-4584-ba85-4dfaa6fd986c	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	TestModel99	TestBrand	ACC-0000	2026-03-11	2026-03-25	active		2026-03-11 08:19:39.586191
\.


--
-- Data for Name: frames; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frames (id, manufacturer, brand, model, color, eye_size, bridge, temple_length, cost, retail_price, status, created_at, barcode, lab_order_number, lab_name, tracking_number, lab_account_number, date_sent_to_lab, multiplier, vision_plan, date_received_from_lab, date_sold, clinic_id, quantity, sold_count, off_board_qty, reorder_count, code, reordered_qty) FROM stdin;
1343636c-56ba-4ff1-910e-c65f3d4dbabd	Michael Kors	Michael Kors	MK4139	Tortoise	54	17	140	68.89	172.00	on_board	2026-03-11 06:37:30.249723	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3006	0
13c8b5af-82c8-497f-9dfe-f9e4aaf31a66	Michael Kors	Michael Kors	MK4119U	Black	53	17	140	68.89	172.00	on_board	2026-03-11 06:37:30.454084	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3005	0
9d81f284-35cc-4d67-b9c1-bfe236d992e3	Nine West	Nine West	NW5211N1	Black	57	16	145	62.00	155.00	on_board	2026-03-11 06:37:30.658953	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
ed161526-b991-4e5e-ad69-7987338e4398	Ralph Lauren	Ralph Lauren	RA7125	Burgundy	53	17	140	85.00	213.00	on_board	2026-03-11 06:37:30.863818	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	5912	0
954f1654-84f9-4b6d-bcf1-056af95d7612	Ray Ban	Ray Ban	RB5432	Pink/Blue Tortoise	54	19	145	78.12	195.00	on_board	2026-03-11 06:37:31.073588	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8397	0
286bc127-3aa8-4683-82d5-b45cb04e7d9b	Tiffany & Co.	Tiffany & Co.	TF2282F	Clear with Blue Temples	53	15	140	137.41	344.00	on_board	2026-03-11 06:37:31.275192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8047	0
287ca022-1b03-49c5-8a1c-22e3fb436f70	Tiffany & Co.	Tiffany & Co.	TF2223B	Ocean Turquoise	54	16	140	158.23	396.00	on_board	2026-03-11 06:37:31.577983	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8124	0
ed8674a4-dd03-4ca5-9aef-b3fad0248590	Safilo	Carrera	CA 8865	Matte Black	54	17	145	42.00	195.00	on_board	2026-03-06 10:24:11.619153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	0
b350486f-75bc-432e-9ac1-675c978488f2	Luxottica	Ray-Ban	RB5154 Clubmaster	Tortoise / Gold	51	21	150	58.50	175.00	on_board	2026-03-06 10:24:11.619153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	0
f9c69a15-fe8a-46dd-aafa-c3c2cf569d92	Silhouette	Silhouette	Momentum 2924	Crystal Grey	50	16	140	89.00	340.00	sold	2026-03-06 10:24:11.619153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	0
95f50b09-82fc-4891-952b-1fd3b6211e87	Marchon	Nike	NK 7252	Navy Blue	56	18	145	33.00	130.00	on_board	2026-03-06 10:24:11.619153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	0
11cbbd81-cca1-4969-882b-1bde1514bc49	Luxottica	Prada	PR 08WV	Pale Gold / Top Black	54	18	140	98.00	360.00	sold	2026-03-06 10:24:11.619153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	0
df8264d5-570f-457e-9bef-07455ae2d50d	Michael Kors	Michael Kors	MK3068	Black on Gold	54	17	140	64.84	162.00	on_board	2026-03-11 06:37:31.990257	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1001	0
2c62eb2b-a28d-4387-859c-b6800dd9ba7a	Luxottica	Ray-Ban	RB5429	Blue Tortoise	53	20	145	68.89	207.00	on_board	2026-03-11 05:34:56.042206	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8356	0
10f71c8b-b150-4926-afaf-e1695f2ce567	Persol	Persol	1014-V-J	Blue	52	20	145	0.00	0.00	on_board	2026-03-11 06:37:32.196826	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1127	0
bdfb5352-6306-4dc9-8d4b-a168d8e94dbd	Kering	Gucci	GG0396O	Havana Brown	52	18	145	115.00	395.00	on_board	2026-03-06 10:24:11.619153	\N	\N	HOYA Lab	\N	632142	2026-02-14	\N	\N	\N	\N	\N	0	0	1	0	\N	0
4392bd8e-0e36-4378-8406-80930df21cdc	Safilo	Boss	BOSS 1084	Dark Ruthenium	53	19	150	67.00	260.00	on_board	2026-03-06 10:24:11.619153	\N	\N	Vision-Craft	\N	Y1500	2026-02-18	\N	\N	\N	\N	\N	0	0	1	0	\N	0
9d6a2c5c-1896-4107-aa9b-0e39c114f300	Luxottica	Ray-Ban			52	18	145	60.00	180.00	on_board	2026-03-06 17:34:08.777604	\N	1312313	Opti-Craft	12312312313	18369	2026-03-02	3.0000	VSP	\N	\N	\N	0	0	1	0	\N	0
02e901e5-5475-4cac-ace7-ce4835def146	Marchon	Nike	09098	red	55	18	145	65.00	195.00	on_board	2026-03-10 19:44:21.466784	\N	\N	\N	\N	\N	\N	3.0000	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	1	\N	0
0b72b7ce-5f9f-4b70-8989-f3d5f1289ac7	Luxottica	Brooks Brothers	bb986	black	52	18	145	70.00	210.00	on_board	2026-03-10 19:43:25.376675	\N	\N	\N	\N	\N	\N	3.0000	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	0	0	1	0	\N	0
caa126b4-8bc6-4187-af81-330d7d7c7e54	Vision Source	Vision Source	PL167	Black	54	17	145	73.33	183.00	on_board	2026-03-11 06:37:32.398079	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
a38eabf1-1cb9-421c-aacb-f13d99b3e280	Test Mfg	Test Brand	TB999	Black	52	18	145	50.00	125.00	on_board	2026-03-11 06:27:30.710613	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1001	0
7fe55a07-8568-4466-b7a7-86b03be3c1a9	Kenmark	Vera Wang	V711	Burgundy	51	16	135	97.00	291.00	on_board	2026-03-06 21:58:15.589196	\N	\N	\N	\N	\N	\N	3.0000	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	0	0	1	0	\N	0
eb67d68a-383f-498d-af0e-006ebd4912a0	Michael Kors	Michael Kors	MK4171U	Black	52	16	140	68.89	172.00	on_board	2026-03-11 06:37:28.545235	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3005	0
b5720049-dc9b-4a34-a403-3d66b6c90831	Vision Source	Vision Source	PL260	Black	57	17	145	73.33	183.00	on_board	2026-03-11 06:37:28.720686	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
95ff4f95-b759-4554-b7f1-a8575761c2ff	Michael Kors	Michael Kors	M4135U	Ash/RoseGold	54	17	140	59.63	149.00	on_board	2026-03-11 06:37:29.024691	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	4003	0
53549ffb-d8c0-4259-96b0-344b8c2aef4c	Vision Source	Vision Source	PL267	Clear	57	18	145	73.33	183.00	on_board	2026-03-11 06:37:29.226087	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
f1c27f84-656d-4257-982d-4c8157987ce9	Ray Ban	Ray Ban	RB5429	Blue Tortoise	53	20	145	66.50	166.00	on_board	2026-03-11 06:37:29.430021	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8356	0
5466c64f-5b46-426e-b338-dc682b5b1db4	Ray Ban	Ray Ban	RB5169	Black On Clear	54	16	140	69.31	173.00	on_board	2026-03-11 06:37:29.635422	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2034	0
561cf80a-c504-4758-90c7-2339b692e35a	Vision Source	Vision Source	PL2431	Black	53	17	140	73.33	183.00	on_board	2026-03-11 06:37:32.603477	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	87	0
9e8bb72f-d110-4b31-9446-e7f23d9485d2	Oakley	Oakley	OX8186	Clear	56	16	139	84.82	212.00	on_board	2026-03-11 06:37:29.802862	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	356	0
ce27d366-0f38-4dc8-b557-7524353dda6a	Ray Ban	Ray Ban	RB5433	Violet On Clear	52	19	140	70.46	176.00	on_board	2026-03-11 06:37:30.046436	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8364	0
854bfa27-5ae1-4ded-9273-e9602d1c9340	Vision Source	Vision Source	PL2430	Nude	57	18	145	73.33	183.00	on_board	2026-03-11 06:37:32.774531	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	80	0
287fe1e1-6e43-4816-b46b-eb9aab6f9a1a	Oakley	Oakley	OX8197D	Matte Olive Ink	50	18	137	90.21	226.00	on_board	2026-03-11 06:37:32.914056	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	350	0
faa48469-6223-4352-ad8c-67c467a09c6c	Vision Source	Vision Source	PL271	Black	51	20	140	73.33	183.00	on_board	2026-03-11 06:37:33.11773	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
687e5f4c-f59b-40d0-88cd-679e0193facd	Luxottica	Ray-Ban	RB 5421	Transparent Clear 2001	53	19	145	75.00	225.00	on_board	2026-03-06 21:49:23.892876	\N	\N	\N	\N	\N	\N	3.0000	\N	\N	2026-03-10	438b0785-980d-4e7f-8efd-e4546d58dbf6	0	1	1	1	\N	1
f7395b37-8ac4-4d4f-a314-f5094e8f7ee5	Nine West	Nine West	NW52331	Grey/Black	52	17	135	62.00	155.00	on_board	2026-03-11 06:37:33.322141	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
f5eb2d3a-665a-4b3a-8b72-12ebc69afbc3	Marchon NYC	Marchon NYC	M4031	Purple	52	17	140	49.00	123.00	on_board	2026-03-11 06:37:33.695235	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	504	0
ea7421d0-7e0f-49f1-8fbe-0b79ef1ed056	Longchamp	Longchamp	LO2735N1	Black	54	16	140	87.50	219.00	on_board	2026-03-11 06:37:33.835581	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
c11c4a46-0888-470c-ae53-1c3474795fc0	Nine West	Nine West	NW52311	Trans Grey	53	16	140	68.00	170.00	on_board	2026-03-11 06:37:34.041244	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
a82aea13-8af1-44a1-b0a0-39cc4d11a15b	Marchon NYC	Marchon NYC	M4024	Gold	56	16	140	55.00	138.00	on_board	2026-03-11 06:37:34.196407	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	204	0
1e138294-de87-4220-a29a-0bc44368c118	Nine West	Nine West	NW5233	Green	52	17	135	62.00	155.00	on_board	2026-03-11 06:37:34.344266	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	40	0
07baa742-bf5b-47e3-924a-fc8e8013e824	Blackfin	Blackfin	BF863	1168	52	18	135	179.00	448.00	on_board	2026-03-11 06:37:34.547943	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	5218	0
004d1035-f6b3-4593-a325-e50dcdd84273	Vision Source	Vision Source	PL202	Blue/Tortoise	55	17	145	73.33	183.00	on_board	2026-03-11 06:37:34.758731	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
71a7d20a-363d-4558-bdd8-ef29aa622b17	Michael Kors	Michael Kors	MK4060U	Burgundy	54	15	140	59.63	149.00	on_board	2026-03-11 06:37:34.958259	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3344	0
9b558cda-420d-48a0-aaf1-f7c64efb1187	Flexon	Flexon	606N	Gun	56	19	145	78.50	196.00	on_board	2026-03-11 06:37:35.166198	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	218	0
3eb401c6-d6e9-4d02-9efd-70a379094696	Tiffany & Co.	Tiffany & Co.	TF2109HB	Ocean Turquoise	51	17	140	139.08	348.00	on_board	2026-03-11 06:37:35.374264	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8124	0
15e82594-5a05-4443-9b92-c0a32996ef92	Vision Source	Vision Source	PL151	Clear	52	18	140	73.33	183.00	on_board	2026-03-11 06:37:35.573562	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
e2feaa85-b62b-4eac-81ab-3ab0376f1339	Flexon	Flexon	W3044	Brown	52	16	135	78.50	196.00	on_board	2026-03-11 06:37:35.7639	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	203	0
d3e33337-bd9d-476c-bc74-9523ae0fd089	Tiffany & Co.	Tiffany & Co.	TF2268U	Black	54	17	140	167.81	420.00	on_board	2026-03-11 06:37:35.904353	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
610d5113-3140-4454-811e-fe348e8a772c	Blackfin	Blackfin	BF863	1742	49	17	135	179.00	448.00	on_board	2026-03-11 06:37:36.085027	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	4917	0
6fe342c6-1864-4530-90ef-27a54c2d5a77	BEBE	BEBE	BB5191	Jet Gradient	54	17	135	85.00	213.00	on_board	2026-03-11 06:37:36.29009	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	11	0
45b0def2-086a-4abe-8cec-e8dcb6da8ffd	Blackfin	Blackfin	BF765	1111	49	15	145	179.00	448.00	on_board	2026-03-11 06:37:36.494254	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
eb1c7903-c142-4720-a39e-b6fdbc4684b3	Vision Source	Vision Source	PL2432	Silver/Purple	53	17	140	73.33	183.00	on_board	2026-03-11 06:37:36.712508	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	88	0
98db95a4-ea5a-44c5-843a-69e5d964c390	Titanflex	Titanflex	M1010	Black	49	21	145	78.95	197.00	on_board	2026-03-11 06:37:36.92226	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
a65e651f-dfc8-4ddd-a36b-05fbc0aa6a7a	Tiffany & Co.	Tiffany & Co.	TF2160B	Tortoise / Tiffany Blue	54	17	140	158.23	396.00	on_board	2026-03-11 06:37:37.110798	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8134	0
2f42ba9e-ad6a-417e-bfcb-b4de9f638bd3	Vision Source	Vision Source	PL228	Tortoise	52	19	140	73.33	183.00	on_board	2026-03-11 06:37:37.319766	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
85260f82-01ad-4f5d-91b9-6c92f3084926	Ray Ban	Ray Ban	RB5154	Striped Blue	53	21	150	82.92	207.00	on_board	2026-03-11 06:37:37.526404	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8374	0
98a5ce58-223e-4a5b-8a6f-f60085052f47	Tiffany & Co.	Tiffany & Co.	TF2160B	Brown	54	17	140	158.23	396.00	on_board	2026-03-11 06:37:37.69882	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8255	0
1f4b6aa9-a9f4-40de-b629-f65d9c6ba848	Tiffany & Co.	Tiffany & Co.	TF2266	Black	53	17	140	139.08	348.00	on_board	2026-03-11 06:37:37.838771	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
5c9cd2b1-ec07-488f-b85b-e075ea360691	Vision Source	Vision Source	PL247	Black	55	17	140	73.33	183.00	on_board	2026-03-11 06:37:38.033846	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
1783f799-8c10-4dc9-af75-1a5ad791a4f1	Tiffany & Co.	Tiffany & Co.	TF2244F	Black	53	16	140	135.00	338.00	on_board	2026-03-11 06:37:38.24005	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
de211066-8552-463b-a001-5893b1144fdc	Blackfin	Blackfin	BF993	1597	54	18	145	179.00	448.00	on_board	2026-03-11 06:37:38.441629	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
691be676-65f9-49d9-aaf3-73fc84f80fba	Titanflex	Titanflex	HTF012	Black	49	20	135	94.95	237.00	on_board	2026-03-11 06:37:38.652324	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
12cc964f-e8d0-479a-9c07-73ba009d9fba	BEBE	BEBE	BB5202	Topaz	53	16	140	75.00	188.00	on_board	2026-03-11 06:37:38.851214	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	200	0
de9076f2-4ce0-41dc-a681-36cb3077be1a	Vision Source	Vision Source	PL259	Pink	56	18	145	73.33	183.00	on_board	2026-03-11 06:37:39.062541	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
561e43ed-a618-4883-9eb3-140eb1c62495	Swarovski	Swarovski	SK2015	Yellow Tortoise	51	16	140	85.00	213.00	on_board	2026-03-11 06:37:39.260752	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1009	0
4de00bb2-59ab-4b0c-9d97-68e41acfd240	Flexon	Flexon	W3041	Gold	49	18	135	78.50	196.00	on_board	2026-03-11 06:37:39.467321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	710	0
65ecf15c-558a-40c4-85e7-dc96341f226e	Vera Wang	Vera Wang	V711BU	Burgundy	51	16	135	97.00	243.00	on_board	2026-03-11 06:37:39.62015	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
b39d6ba7-9ae3-427e-b699-5522af1f409a	Tiffany & Co.	Tiffany & Co.	TF2269U	Havana Madrepper	54	16	140	158.23	396.00	on_board	2026-03-11 06:37:39.779846	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8428	0
a1ba10c9-366f-4c6f-a99a-2f5eecceba72	Tiffany & Co.	Tiffany & Co.	TF2260	Black	55	16	140	129.51	324.00	on_board	2026-03-11 06:37:39.977637	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
fafc69bf-d77d-4b12-9fb1-e12d76c87919	Vision Source	Vision Source	PL2430	Grey	56	19	145	73.33	183.00	on_board	2026-03-11 06:37:40.187313	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	28	0
f69315e3-0b31-4741-93cd-a17f60f710ca	Tiffany & Co.	Tiffany & Co.	TF2270B	Black on Tiffany Blue	55	16	140	139.08	348.00	on_board	2026-03-11 06:37:40.389908	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
0489e366-5250-4958-b5a9-a1653b9d51b2	Tiffany & Co.	Tiffany & Co.	TF2271	Marble Blue	54	17	140	134.00	335.00	on_board	2026-03-11 06:37:40.593028	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8432	0
500948d6-0a25-449d-972a-d571f659a415	Marchon NYC	Marchon NYC	M4035	Copper on Gold	53	17	140	49.00	123.00	on_board	2026-03-11 06:37:40.794738	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	211	0
1c325f59-4b31-4d3d-9114-aaf6c35b21d6	Marchon NYC	Marchon NYC	M2039	Black	53	18	140	49.00	123.00	on_board	2026-03-11 06:37:41.00158	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2	0
46da85f2-e718-4f4d-9910-f4756b032e35	Ray Ban	Ray Ban	RX5421	Clear	55	19	140	0.00	0.00	on_board	2026-03-11 06:37:41.208566	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2001	0
fc552872-712c-415e-b8cd-d078709d7a34	Michael Kors	Michael Kors	MK4171U	Tort/Gold	54	16	140	68.89	172.00	on_board	2026-03-11 06:37:41.41106	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3006	0
78fa0b16-8f0e-4b9d-b5c5-6f9a9931e4c3	Vision Source	Vision Source	PL2432	Black	52	16	140	73.33	183.00	on_board	2026-03-11 06:37:41.615977	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	80	0
85fa4e01-9c2b-454f-8a20-152bce73e325	Tiffany & Co.	Tiffany & Co.	TF2245	Black	54	16	140	153.21	383.00	on_board	2026-03-11 06:37:41.822519	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8001	0
0b3911e1-8b8f-4b53-88d5-5dd5d2d25235	Michael Kors	Michael Kors	MK4178	Nude Pink	54	16	140	80.00	200.00	on_board	2026-03-11 06:37:42.026546	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	4038	0
9d157284-0a94-4926-a5bd-df484c8b6dea	Tiffany & Co.	Tiffany & Co.	TF2277	Blonde Havana	51	17	140	137.41	344.00	on_board	2026-03-11 06:37:42.229552	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8064	0
08e50ae1-a712-45af-9bc1-40e273cb01e3	Tiffany & Co.	Tiffany & Co.	TF2255U	Burgundy	54	17	140	148.66	372.00	on_board	2026-03-11 06:37:42.371438	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8389	0
7542edd3-a3d3-4176-b117-ad615438b11d	BEBE	BEBE	BB5255	Cheetah/Clear	53	19	140	65.50	164.00	on_board	2026-03-11 06:37:42.542933	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	970	0
96e0886e-0c08-4ef0-985c-9458de17447b	Marchon	Marchon	M4032	715	52	17	135	49.00	123.00	on_board	2026-03-11 06:37:42.742381	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	271	0
ef5108ed-3aa0-4f48-96eb-99acc39dfeb5	Tory Burch	Tory Burch	TY2122U	Clear/Gold	52	17	140	95.00	238.00	on_board	2026-03-11 06:37:42.949981	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1821	0
22009d85-f8c2-418d-be54-1c8b3331523b	Ray Ban	Ray Ban	RB7214 Gina	Brown/Violet Tortoise	51	21	140	75.00	188.00	on_board	2026-03-11 06:37:43.152667	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8258	0
dfb44fab-b55f-44a7-bb0f-434520842960	Anne Klein	Anne Klein	AK5120	Navy	54	17	140	68.00	170.00	on_board	2026-03-11 06:37:43.359167	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	770	0
0aa71f70-cd74-40b3-95b4-643bc96bb7f5	Michael Kors	Michael Kors	MK3091B	Silver	54	16	140	80.00	200.00	on_board	2026-03-11 06:37:43.561104	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1893	0
20eac4df-f4c6-4d7c-9db7-f18671a9c218	Tiffany & Co.	Tiffany & Co.	TF1127	Black on Gold	54	16	140	139.08	348.00	on_board	2026-03-11 06:37:33.526436	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	2	0	0	1	6122	0
76bd1162-04f3-4e19-999e-91d4b7dbd0a1	Nine West	Nine West	NW5240N	Green	55	17	140	68.00	170.00	on_board	2026-03-11 06:37:43.867379	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	340	0
bc29aaf0-e3e0-47d7-bcd0-44d5b6024773	Ray Ban	Ray Ban	RB7330 Xena	Black	52	22	145	65.66	164.00	on_board	2026-03-11 06:37:44.0731	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8260	0
e3f1d055-db6a-4b19-af04-8f9ea9032b58	Vision Source	Vision Source	PL255	Brown/Tortoise	56	17	145	73.33	183.00	on_board	2026-03-11 06:37:44.249095	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
4d4931f0-3ef2-4ecd-ad09-2e236c0714d3	Michael Kors	Michael Kors	MK4115U	Black/Tortoise	52	17	140	68.89	172.00	on_board	2026-03-11 06:37:44.394368	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3950	0
1b1782f8-c884-4f06-a94a-ec14f86485f2	Tiffany & Co.	Tiffany & Co.	TF2198B	Brown/Tortoise	53	16	140	100.00	250.00	on_board	2026-03-11 06:37:44.690174	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8015	0
ed0e6b16-bb2d-4eaa-be24-e22415d8e564	Vision Source	Vision Source	PL132	Grey	54	18	145	73.33	183.00	on_board	2026-03-11 06:37:44.894689	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
731d91df-451b-4e87-92bc-162b6f6a8764	Michael Kors	Michael Kors	MK3071	1014	54	17	140	60.74	152.00	on_board	2026-03-11 06:37:45.094451	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	104	0
21404e9c-f895-4767-950e-e582bd1e7e1a	Tiffany & Co.	Tiffany & Co.	TF2246	Black	54	16	140	167.81	420.00	on_board	2026-03-11 06:37:31.807517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	2	0	0	1	8001	0
598c7d4a-78ee-4732-9c13-00e2121fe88f	Tiffany & Co.	Tiffany & Co.	TF2272U	Havana	54	17	140	158.23	396.00	on_board	2026-03-11 06:37:45.508068	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8015	0
a63a94ff-3318-4e0c-92f1-763315a42fc9	Blackfin	Blackfin	Pacific BF1038	Black	51	18	145	195.00	488.00	on_board	2026-03-11 07:10:15.703059	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
c22eb81d-ae5a-42ac-bfd7-01e49a74c057	Blackfin	Blackfin	Westhampton BF9911	Green	56	18	145	179.00	448.00	on_board	2026-03-11 07:10:15.90361	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
6dd67900-d061-45ed-a4f8-0f42b3d1f267	Blackfin	Blackfin	Barrow BF1116	Blue	53	18	145	179.00	448.00	on_board	2026-03-11 07:10:16.046214	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
46ee7aa4-1b4c-45b9-830f-0c69b51edc60	Blackfin	Blackfin	SKagan BF1050	Green	53	18	145	179.00	448.00	on_board	2026-03-11 07:10:16.356052	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
dc1d35bc-4cee-4549-9bb3-96f2d25714fa	Brooks	Brooks	BB2076U	Warm Tort	57	18	145	71.67	179.00	on_board	2026-03-11 07:10:16.558003	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6161	0
4f769b26-9a77-4300-8481-6b34e8d0f38a	Brooks	Brooks	BB2065U	Grey Trans	54	18	145	57.33	143.00	on_board	2026-03-11 07:10:16.764565	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6168	0
a9149d28-6bc1-4561-a329-7e0eb6347be8	Brooks	Brooks	BB1123	Matte Silver Grey	55	18	145	60.67	152.00	on_board	2026-03-11 07:10:16.91884	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1032	0
b0d7cdaf-d70e-4703-bf22-ba82d50baa7e	Brooks	Brooks	BB2071U	Warm Tort	51	18	145	68.33	171.00	on_board	2026-03-11 07:10:17.071986	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6161	0
13926ed7-fbef-4cd9-9e7d-68927141aff0	Brooks	Brooks	BB1046	Gun	55	18	145	57.33	143.00	on_board	2026-03-11 07:10:17.277143	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1507	0
93412999-a7ba-482a-84ae-53d3fbd0f115	Brooks	Brooks	BB1111	Matte Bronze	53	18	145	60.67	152.00	on_board	2026-03-11 07:10:17.588639	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1021	0
5181bf9a-51d7-4bd4-8788-b2e68e4395be	Brooks	Brooks	BB2019	Trans Grey	53	18	145	71.67	179.00	on_board	2026-03-11 07:10:17.730529	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6074	0
1c802dbd-3619-4128-8c7e-4bb706a5f24f	Brooks	Brooks	BB2074U	Olive/Tortoise	54	18	145	57.33	143.00	on_board	2026-03-11 07:10:17.893185	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6075	0
80271148-cd53-480e-a95a-e548a7e1d065	Brooks	Brooks	BB2067U	Black	53	18	145	60.67	152.00	on_board	2026-03-11 07:10:18.056258	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6064	0
af03425f-730a-497a-97da-e51d9de7502a	Calvin Klein	Calvin Klein	CK2651	Tortoise	53	18	145	89.00	223.00	on_board	2026-03-11 07:10:18.302748	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	6240	0
5690cf46-e017-43ed-af9d-c0882c776cdb	Calvin Klein	Calvin Klein	CK19569	Trans Grey	55	18	145	65.00	163.00	on_board	2026-03-11 07:10:18.505492	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N70	0
0f5ef038-44dc-4f9c-8b77-73b47f296b99	Columbia	Columbia	C3053	Dark Grey	58	18	145	82.50	206.00	on_board	2026-03-11 07:10:18.716381	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N70	0
afb3af79-fa73-4f5b-8459-b936e9151a3d	Columbia	Columbia	C8064	Blue	59	18	145	72.00	180.00	on_board	2026-03-11 07:10:18.918267	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	413	0
a6cfafe3-00e6-413d-8948-9e305b5ccd4c	Columbia	Columbia	C3050	Black/Silver/Blue	60	18	145	82.50	206.00	on_board	2026-03-11 07:10:19.122025	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	410	0
ef697aca-3ab3-4657-a6e0-3a84def08ed0	Dragon	Dragon	DR2059 ATH	Black	54	18	145	89.00	223.00	on_board	2026-03-11 07:10:19.328896	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	13	0
1ad2e502-f602-44cb-83c0-9ce6eec07081	Flexon	Flexon	H6060	Gold	58	18	145	82.50	206.00	on_board	2026-03-11 07:10:19.530098	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N710	0
33714692-431c-42fd-8d96-53762d3c1b28	Flexon	Flexon	607	Silver	51	18	145	78.50	196.00	on_board	2026-03-11 07:10:19.726999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
884ef054-589f-4849-b0de-e3cd14222d19	Flexon	Flexon	H6090	Silver	54	18	145	78.00	195.00	on_board	2026-03-11 07:10:19.879935	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	70	0
7705ec82-2b2d-4c2b-ad67-b2e68c42de40	Flexon	Flexon	Bennedict 600	Black	53	18	145	89.00	223.00	on_board	2026-03-11 07:10:20.063072	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N1	0
985e8818-8e33-413e-b0ae-0b0ce9d7b41e	Flexon	Flexon	E1035	Black/Grey	54	18	145	114.00	285.00	on_board	2026-03-11 07:10:20.220309	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
eb2c204f-0aa0-4831-bb26-02eacac836a8	Flexon	Flexon	H6089	Silver	51	18	145	78.00	195.00	on_board	2026-03-11 07:10:20.449392	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	70	0
83d73630-ccf8-4538-8ce6-c997c9081f4a	Flexon	Flexon	610	Polished Black	55	18	145	78.50	196.00	on_board	2026-03-11 07:10:20.656846	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
46693a9a-d99f-4edc-b3c2-c19111371533	Flexon	Flexon	H6001	Gun	57	18	145	89.00	223.00	on_board	2026-03-11 07:10:20.963375	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	33	0
e42e2b4f-0b38-484c-92ea-0ee04800a1bc	Flexon	Flexon	E1042	Black/Grey	54	18	145	114.00	285.00	on_board	2026-03-11 07:10:21.168948	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
62cfbb7a-ce30-4283-ac93-34ecd2ef9d63	Flexon	Flexon	623	Gunmetal	48	18	145	78.50	196.00	on_board	2026-03-11 07:10:21.372002	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N14	0
8976103d-5eca-4715-8bcf-5ba5f4171e32	Flexon	Flexon	Benjamin 600	Black	56	18	145	89.00	223.00	on_board	2026-03-11 07:10:21.681517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N1	0
c2bf6e6b-e014-4a2f-a438-72962d1bf955	Flexon	Flexon	Collins 600	Gunmetal/Silver	55	18	145	89.00	223.00	on_board	2026-03-11 07:10:21.887032	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
fd51d23f-659d-4fab-9326-3d32ee7ff8ca	Flexon	Flexon	H6080	Matte Silver	56	18	145	78.50	196.00	on_board	2026-03-11 07:10:22.090299	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N71	0
ddfa16f2-e922-4305-b7ba-b50b0e69f9b7	Flexon	Flexon	H6067	Black	55	18	145	78.50	196.00	on_board	2026-03-11 07:10:22.397924	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N1	0
e749e924-6d1e-4002-9c10-fe85a9af138b	Flexon	Flexon	E1162	Black	54	18	145	112.00	280.00	on_board	2026-03-11 07:10:22.601221	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N4	0
e1ad67d2-2a7b-41b6-9072-1b1f08679232	Flexon	Flexon	E1111	Black/Grey	56	18	145	114.00	285.00	on_board	2026-03-11 07:10:22.811983	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N33	0
f6794b71-4486-4d1a-a934-4a9f03b17b50	Giorgio Armani	Giorgio Armani	AR7233	Navy Blue	56	18	145	136.50	341.00	on_board	2026-03-11 07:10:23.014583	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	5543	0
ecce3bdf-ec99-41a2-90e2-853775c7bf40	Hackett	Hackett	HEK1280	Crystal Horn	57	18	145	79.95	200.00	on_board	2026-03-11 07:10:23.214145	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	119	0
13362052-c3da-4a25-976e-cc71eaa5d935	Hackett	Hackett	HEK1386	Black	58	18	145	79.95	200.00	on_board	2026-03-11 07:10:23.421234	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	61	0
3f498783-e69d-43db-9c09-1597e18df57a	Marchon	Marchon	M2039	Black	53	18	145	49.00	123.00	on_board	2026-03-11 07:10:23.629673	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2	0
cc2bc033-ec00-4f55-9d45-f9ae3074cd3c	Marchon	Marchon	M2037	Black	55	18	145	49.00	123.00	on_board	2026-03-11 07:10:23.834843	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2	0
4bb053fb-7ce4-4803-a1d6-653334f7c44b	Marchon	Marchon	M3037	Trans Grey	54	18	145	47.50	119.00	on_board	2026-03-11 07:10:24.038774	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	50	0
ffda322e-d61d-4edb-9cbf-635a5e7d09a1	Marchon	Marchon	M2021	Black	55	18	145	59.00	148.00	on_board	2026-03-11 07:10:24.240886	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N72	0
5d441f14-07c4-4d6e-b6f0-ef53f1c7e2ca	Marchon	Marchon	Moore	Matte Grey / Black	53	18	145	59.00	148.00	on_board	2026-03-11 07:10:24.547364	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N35	0
d967ea24-e374-4954-af82-f6ec5d91a3a2	Marchon	Marchon	M9009	Silver Grey	52	18	145	49.00	123.00	on_board	2026-03-11 07:10:24.753679	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N72	0
8b6c2562-00f1-4b8a-9799-6c66783ea16f	Marchon	Marchon	M3031	Matte Black	55	18	145	54.00	135.00	on_board	2026-03-11 07:10:24.966598	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	3	0
b6115f76-9490-44bd-a540-36ce322d2605	Marchon	Marchon	M2013	Black/Silver	53	18	145	59.00	148.00	on_board	2026-03-11 07:10:25.160348	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N1	0
8149a13a-3f3b-4b13-9bfe-83d7aa1611d5	Marchon	Marchon	M3038	Trans Olive	53	18	145	47.50	119.00	on_board	2026-03-11 07:10:25.366182	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	218	0
3939a162-f8a0-40b7-8693-d3fa9e50721c	Marchon	Marchon	M2036	Black	55	18	145	49.00	123.00	on_board	2026-03-11 07:10:25.572184	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2	0
917a53de-7614-48d4-999e-6f9c34f2dbd8	Nike	Nike	NIKE 5400	Black	53	18	145	105.00	263.00	on_board	2026-03-11 07:10:25.738263	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N1	0
8ea0b06d-10a9-4c46-a89b-12a41c20d847	Nike	Nike	NIKE 100	Grey Fade	57	18	145	75.00	188.00	on_board	2026-03-11 07:10:25.879537	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	129	0
688529f5-6f53-4774-93b0-c4de57e6a7ad	Nike Flexon	Nike Flexon	NIKE 4314	Black	56	18	145	105.00	263.00	on_board	2026-03-11 07:10:26.085795	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N410	0
0a55888b-87a2-44b2-8991-619061b8610d	Nike Flexon	Nike Flexon	NIKE 4319	Satin Gunmetal	55	18	145	105.00	263.00	on_board	2026-03-11 07:10:26.290028	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	70	0
9c2463d3-5b44-4036-90e0-8bac368bda33	Nike Flexon	Nike Flexon	NIKE 4307	Copper	54	18	145	108.00	270.00	on_board	2026-03-11 07:10:26.492651	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	N212	0
eed85a0b-834f-49b8-af04-640e526885c3	Oakley	Oakley	OX8060	Matte Carbon	57	18	145	67.98	170.00	on_board	2026-03-11 07:10:26.699011	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1057	0
1375f003-32e9-49a8-b5ba-7641fc173dcd	Oakley	Oakley	OX8081	Polished Grey Smoke	55	18	145	69.61	174.00	on_board	2026-03-11 07:10:26.902307	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	655	0
866ca5bd-0ad1-4764-ab30-6a972d28655c	Oakley	Oakley	OX8178 Raftor	Polished Clear	57	18	145	64.23	161.00	on_board	2026-03-11 07:10:27.111376	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	357	0
54411b6e-d39a-4e4d-9c05-396fc531642f	Oakley	Oakley	OX8032	Satin Black Camo	55	18	145	73.91	185.00	on_board	2026-03-11 07:10:27.314398	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	355	0
9d5e57db-8f30-4ea6-abfd-9bab854f5468	Oakley	Oakley	OX8149F Pitchman	Satin Black	52	18	145	117.39	293.00	on_board	2026-03-11 07:10:27.512003	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	152	0
ba7a3af2-4c02-4a36-ae5b-39db5f6bdd6a	Oakley	Oakley	OX8177	Olive Ink	54	18	145	82.21	206.00	on_board	2026-03-11 07:10:27.734454	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	754	0
818802ca-14de-4ac0-9fe4-d021833a9e0d	Oakley	Oakley	OX3232	Matte Midnight	54	18	145	100.79	252.00	on_board	2026-03-11 07:10:27.927011	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	454	0
72c54154-b27e-442f-b618-f45458540885	Ray Ban	Ray Ban	RB8903	Navy	55	18	145	109.09	273.00	on_board	2026-03-11 07:10:28.134413	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	5262	0
db43ad03-cf35-478e-858e-6c26e94bae33	Ray Ban	Ray Ban	RB7260F	Dark Tort	54	18	145	83.00	208.00	on_board	2026-03-11 07:10:28.338159	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2012	0
e143f8b1-14c2-4c7c-9ba6-c2b131558651	Ray Ban	Ray Ban	RB3582V David	Gold	49	18	145	83.00	208.00	on_board	2026-03-11 07:10:28.540437	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2500	0
70766bf1-06f3-40da-95cd-a166179f7cd7	Ray Ban	Ray Ban	RB8784D	Silver	54	18	145	87.75	219.00	on_board	2026-03-11 07:10:28.846159	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	1000	0
8db6da45-d3a7-4aaf-9b58-a45693d4f14c	Ray Ban	Ray Ban	RB6494	Black	54	18	145	93.68	234.00	on_board	2026-03-11 07:10:29.020966	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	2861	0
59d09949-3d8d-49c6-8ea1-9134c12f1fdc	Ray Ban	Ray Ban	RB4340V	Striped Grey	50	18	145	99.86	250.00	on_board	2026-03-11 07:10:29.257894	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	8381	0
1350cfd7-11c2-49ca-b1d9-fb53d5768aff	Titan Flex	Titan Flex	M1011	Gunmetal	56	18	145	78.95	197.00	on_board	2026-03-11 07:10:29.565209	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	GUN	0
5dcfb118-7c11-4b9e-b4a6-1720ffb42711	Titan Flex	Titan Flex	M986	Dark Gun Metal	56	18	145	78.95	197.00	on_board	2026-03-11 07:10:29.717325	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	DGN	0
1c80d07e-a56a-4dcc-94a0-7cfdcda18625	Vision Source	Vision Source	PL155	Brown/Clear	54	18	145	73.33	183.00	on_board	2026-03-11 07:10:29.874133	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
daebf15a-e2f5-415e-b53a-3fe25fb979f3	Vision Source	Vision Source	PL105	Gunmetal	47	18	145	73.33	183.00	on_board	2026-03-11 07:10:30.240836	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
c2cc26aa-f02c-438a-808d-7694fc2517c1	Vision Source	Vision Source	PL127	Black	54	18	145	73.33	183.00	on_board	2026-03-11 07:10:30.594747	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	438b0785-980d-4e7f-8efd-e4546d58dbf6	1	0	0	0	\N	0
\.


--
-- Data for Name: lab_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_orders (id, clinic_id, frame_id, frame_brand, frame_model, frame_color, frame_manufacturer, vision_plan, lab_name, lab_order_number, lab_account_number, tracking_number, date_sent_to_lab, date_received_from_lab, status, created_at, frame_sold, frame_sold_at, patient_own_frame, notes, custom_due_date) FROM stdin;
f60f3286-e230-4bb6-ad1f-8609d9d480e2	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	Nine West	NW5233	GREEN CRYSTAL	Marchon	Private Pay	Hoya Vision Care Lab	SP668UG5	632142	1zE2F8028411483323	2026-03-05	2026-03-06	received	2026-03-06 20:13:01.886451	f	\N	f	\N	\N
4af1cd8d-94a7-4199-a1b1-2741d225ad3f	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	Nine West	NW5233	GREEN CRYSTAL	Marchon	VSP	Hoya Vision Care Lab	2312311	632142	\N	2026-03-02	2026-03-06	received	2026-03-06 20:49:48.965602	t	2026-03-06	f	\N	\N
970e512e-073d-45e8-9619-eaab0630248b	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	Flexon	12124	Black/Black	Marchon	VSP	Hoya Vision Care Lab	24234	632142	\N	2026-03-02	2026-03-06	received	2026-03-06 21:18:02.626786	t	2026-03-06	f	\N	\N
5e218e68-815d-4426-960a-ce98b612ab03	\N	\N		PL 243282			\N	\N	123123	\N	\N	\N	\N	received	2026-03-06 22:26:46.676309	f	\N	f	\N	\N
8ebef1c5-af22-4ec5-98b6-4d6402e62124	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	Nine West	NW5233	GREEN CRYSTAL	Marchon	VSP	Opti-Craft	12341241	18369	\N	2026-03-08	2026-03-08	received	2026-03-08 06:00:54.204642	t	2026-03-08	f	\N	\N
5e5da9ab-02f9-434a-9d52-2bc1ec26c7de	\N	\N	Nine West	NW5233		Nine West	\N	\N	SP668UG5	\N	\N	\N	\N	pending	2026-03-06 21:20:12.921733	t	2026-03-06	f	\N	\N
fda3e7ff-a211-4152-a934-e55d761b8a56	\N	\N	Dragon	DR2049N		Dragon	VSP	Opti-Craft	1312313	18369	12312312313	2026-03-07	\N	pending	2026-03-07 00:00:00	t	2026-03-06	f	\N	\N
7c5b1ee2-c2cc-42ba-a18b-3a8deb684b4e	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N	Patient Own Frame	POF	—	—	\N	Custom Eyelab	\N	1015	\N	2026-03-06	\N	pending	2026-03-08 08:36:05.96458	f	\N	t	\N	2026-01-01
739afbc7-a365-4f73-867e-92f3663e5111	438b0785-980d-4e7f-8efd-e4546d58dbf6	687e5f4c-f59b-40d0-88cd-679e0193facd	Ray-Ban	RB 5421	Transparent Clear 2001	Luxottica	\N	\N	\N	\N	\N	2026-03-10	\N	pending	2026-03-10 20:35:16.291674	t	2026-03-10	f	\N	\N
060ec72c-8fa7-41aa-bbce-b2eec357e10e	438b0785-980d-4e7f-8efd-e4546d58dbf6	687e5f4c-f59b-40d0-88cd-679e0193facd	Ray-Ban	RB 5421	Transparent Clear 2001	Luxottica	\N	\N	\N	\N	\N	2026-03-10	\N	pending	2026-03-10 21:26:17.664447	t	2026-03-10	f	\N	\N
\.


--
-- Data for Name: labs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labs (id, name, account, created_at, clinic_id) FROM stdin;
17dd488b-1c09-448f-ac9b-d28efb7fd12d	Vision-Craft	Y1500	2026-03-06 10:24:11.724433	\N
8e02aee1-d794-449a-b4e3-60b355639510	Opti-Craft	18369	2026-03-06 10:24:11.771049	\N
389c7aa0-4927-4d58-8954-b7f577b65ea5	Custom Eyelab	1015	2026-03-06 10:24:11.81526	\N
926afec7-47f4-42b5-af83-a5a221ca5de1	HOYA Lab	632142	2026-03-06 10:24:11.85975	\N
78eeed8d-d42d-4f57-8851-f627e2d7b79b	Frame Dream	fd10673	2026-03-06 10:24:11.904303	\N
a95ce6fd-0b60-44fe-950a-ae2d18c885fc	Vision-Craft	Y1500	2026-03-06 18:47:59.643889	438b0785-980d-4e7f-8efd-e4546d58dbf6
718440f2-3382-44d3-92c4-8eeaf893cb27	Hoya Vision Care Lab	632142	2026-03-06 18:48:22.165495	438b0785-980d-4e7f-8efd-e4546d58dbf6
7eb5fa4c-bbc1-4268-9ca7-b8a7d5c28c96	Opti-Craft	18369	2026-03-06 18:48:37.270388	438b0785-980d-4e7f-8efd-e4546d58dbf6
7fdd335a-5320-4990-89a4-2477a430dd76	Custom Eyelab	1015	2026-03-06 18:48:49.315952	438b0785-980d-4e7f-8efd-e4546d58dbf6
\.


--
-- Data for Name: manufacturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manufacturers (id, name, created_at) FROM stdin;
711b6e0d-a0a4-4690-9687-d458740f2016	Luxottica	2026-03-06 10:24:11.995443
d3e41287-ad15-4d7a-b210-e17cff52742b	Marchon	2026-03-06 10:24:13.220539
ba126f2f-64e6-4ebc-b57f-038bfb5bb06c	Safilo	2026-03-06 10:24:13.885661
aa4342e2-9df5-474e-8ba2-3d7ae512f133	Kering	2026-03-06 10:24:14.508615
9adbcabb-4cfc-4dc7-8f82-040dc294301e	Marcolin	2026-03-06 10:24:14.99778
11357851-a83c-46a4-91f2-a7e749aed318	Kenmark	2026-03-06 10:24:15.443901
e378687b-0e78-4018-bfff-eb28f629aaee	Silhouette	2026-03-06 10:24:15.796056
df4cef88-9f0e-44f0-9942-a270f709e62e	De Rigo	2026-03-06 10:24:15.92753
062d954b-08f3-406e-95ac-564e226fac49	Charmant	2026-03-06 10:24:16.222222
2a9aeb1f-aef8-47c1-8bed-07d025b4d192	Altair	2026-03-06 10:24:16.401101
bbf25f86-5483-440e-950b-cf3542d83965	Blackfin	2026-03-06 10:24:16.62138
7a7096c9-05ac-4ae9-857b-475682c25ce4	Vision Source Smart	2026-03-06 21:46:16.825626
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
lcZdnPUGyGqkuzWeI5zWni40PkKX5azb	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T09:09:57.168Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773565797168}	2026-03-15 09:10:53
EshMSvdRZN-MEr463pylhDIFR-HNeUH_	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T08:08:39.398Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773562119398}	2026-03-15 08:08:40
pg4g1rm1RYlLIV64nGvkyR61hhOo_HsF	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T07:45:45.011Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773560745011}	2026-03-15 07:45:57
-LS9Xolh5RCEnKZcgFPKW3FIJ71zBlPs	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T07:47:03.272Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773560823272}	2026-03-15 07:47:04
bO11GeWiP-Kg0-HBgNUpLue3sj-Fvhx8	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T07:47:11.798Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773560831798}	2026-03-15 07:47:12
YAVxvCfeIFOhKoBHKV-4eYGAt96X_3Da	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-13T20:31:30.651Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773433890651}	2026-03-18 03:22:32
haoSplknzQm9-3_T2OS_w7JAYYRqouih	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T08:33:48.305Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773563628305}	2026-03-15 08:33:55
DUkNTwH-O8sIaTPvaQ0OFI6Kbp7mMKZ1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T08:59:37.931Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773565177930}	2026-03-15 08:59:49
8jVdW-I8BufnfH2EeE3Gxv9HckNeS7Lv	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T09:18:56.669Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773566336669}	2026-03-15 09:19:32
Ylti-roMkjC6U4Ral6Zj_L_SaCvXsNB1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-17T20:23:49.966Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773779029966}	2026-03-17 20:23:51
MWu_yFhrn3CPRZqlJMvO_i9e2ALzgUMd	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T08:35:13.268Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773563713268}	2026-03-15 08:37:58
4W15n-WPPJSUaQ16E-bJqxY3LHf8_XSB	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:33:00.428Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773808380428}	2026-03-18 04:45:47
qHTc6L--9i1CxW24Vux35Tr6pmF5Df_1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-17T20:15:22.410Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773778522410}	2026-03-17 20:15:37
lGsRF7qk3dnyYg8phOznkIPkafONNJxb	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:17:28.367Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773807448367}	2026-03-18 04:17:35
ThI_24fbGSoGZUdZxrq9R_edeqXw8mg4	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:08:53.365Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773806933364}	2026-03-18 04:09:00
ZXM635k53fyhNJNOvvXfx_UhnMvUGmOv	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:56:28.297Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773809788297}	2026-03-18 04:56:29
yGOxijeZAoi31fgXbeSgQGQbKX63LvMr	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:21:12.528Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773807672528}	2026-03-18 04:21:20
cyAQuk7xXXLX8ns7pUnkYwOWf98eRwNJ	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:10:10.094Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773821410094}	2026-03-18 08:10:37
Hog3J04OEhGr6Ezk2e-QGgOyB_thGhG3	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:08:38.330Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773821318330}	2026-03-18 08:08:39
P8G1B3QQcBTJyrFGAC6OGKC8Up04Oyke	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T05:34:01.705Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773812041705}	2026-03-18 05:34:57
Qbtw_0AKsk-I09nMZtqS2HSexUq5nG42	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:16:45.263Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773821805263}	2026-03-18 08:16:52
q40vZ955nx6SIfzZxW5a0hzIAwu--UAM	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T07:10:20.680Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773558620680}	2026-03-15 07:11:14
xPZMe1JP2TsHh6ZxZYQdsdlLv6YDNlwI	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:21:13.219Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773822073219}	2026-03-18 08:21:19
hC9jzv02H7XZ5CCjfpYoMuJI2QOMTEol	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:16:24.417Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773807384416}	2026-03-18 04:16:25
zNoxw5KTmx42--4cO74OB959wr0yeKZw	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T09:26:59.857Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773566819857}	2026-03-15 09:27:49
XYwMevPpMqAUndOUC_7DIK8_-8JFqWF5	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-17T20:24:01.441Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773779041441}	2026-03-17 20:24:03
PquppMtNUN3v2wUIjWj_-zxzP1o7Zj5-	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T08:39:21.931Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773563961931}	2026-03-15 08:40:51
qxkgPTi2GNKmUqaCs4VBLcmO0c88Tnl5	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:03:05.144Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773806585144}	2026-03-18 04:03:25
5S8oiFKi3LzO2pqSOAtAH8ZO1LL0q3TE	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T07:46:13.731Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773560773731}	2026-03-15 07:46:33
HZ2szOE0VXgsSl0so1TyE6XUGGi0spbu	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-15T06:58:44.841Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773557924841}	2026-03-15 20:29:04
s4UOkEzrL7YkKZqd3V78NJXKIcFX_BZf	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:29:47.875Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773808187875}	2026-03-18 04:29:48
KkL6Ta1vd314ZGfMOso3BvqSGYvsu2DI	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T06:27:07.947Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773815227947}	2026-03-18 06:28:44
lStDDZ8ubL-HVWyve_qPLeGdaBBNm1yt	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:12:00.106Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773821520106}	2026-03-18 08:12:32
QYICDKO2fnwhZgTDvCYYeqAF-OdOrkUE	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T07:28:59.000Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773818939000}	2026-03-18 07:30:25
QTgDUvnCmtfnbO1cYQoVgQGkpxqrxIWU	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T04:16:40.325Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773807400325}	2026-03-18 04:16:53
RwEYFJk41s6YSjFA_G3aYtm-FfxUxRQD	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-18T08:18:58.218Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773821938218}	2026-03-18 08:19:40
FvGbn361T210zedROn44s_GC7B2Xpc8M	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-17T19:14:50.627Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"622b3e2d-6954-4ccf-bd8c-b5e2d14add7a"},"expiresAt":1773774890627}	2026-03-18 08:55:54
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value) FROM stdin;
reminderEmail	
emailFrom	
labReminderDays	14
labTurnaroundDays	14
defaultMultiplier	
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, email, role, invite_token, invite_expiry, is_active, created_at, clinic_id) FROM stdin;
622b3e2d-6954-4ccf-bd8c-b5e2d14add7a	EllaissaC	$2b$10$2d2SwLKOJguQ62u08ZOWx.Ge09dyiQSh6e3EokyntOl8Y8TPbBxWW	caguiatellaissa5@gmail.com	admin	\N	\N	t	2026-03-06 09:05:57.223136	438b0785-980d-4e7f-8efd-e4546d58dbf6
\.


--
-- Data for Name: weekly_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_metrics (id, week_starting, total_comprehensive_exams, follow_ups, total_optical_orders, created_at, clinic_id, daily_data) FROM stdin;
35452de5-deac-4126-815b-0e0f13c75082	2026-02-02	75	58	36	2026-03-06 11:16:56.502669	\N	\N
93d3b8d4-fddf-4b81-ab08-0c7ab2a38fff	2026-02-09	63	40	19	2026-03-06 11:17:47.048192	\N	\N
2e8a51af-9156-4c15-8f83-d7b91c8a7705	2026-03-02	87	67	73	2026-03-08 05:53:32.507663	438b0785-980d-4e7f-8efd-e4546d58dbf6	\N
b02b4fed-1766-45ce-bba4-50b43aab4cd2	2026-03-03	21	15	12	2026-03-08 09:19:31.386	438b0785-980d-4e7f-8efd-e4546d58dbf6	{"mon":{"comps":"8","orders":"5","followUps":"6"},"tue":{"comps":"7","orders":"4","followUps":"5"},"wed":{"comps":"6","orders":"3","followUps":"4"},"thu":{"comps":"","orders":"","followUps":""},"fri":{"comps":"","orders":"","followUps":""},"sat":{"comps":"","orders":"","followUps":""},"sun":{"comps":"","orders":"","followUps":""}}
12dc0b9a-4d57-466f-94d6-d9b7883a36a4	2026-03-10	43	10	12	2026-03-08 09:27:48.287503	438b0785-980d-4e7f-8efd-e4546d58dbf6	{"mon":{"comps":"15","orders":"12","followUps":"10"},"tue":{"comps":"20","orders":"","followUps":""},"wed":{"comps":"8","orders":"","followUps":""},"thu":{"comps":"","orders":"","followUps":""},"fri":{"comps":"","orders":"","followUps":""},"sat":{"comps":"","orders":"","followUps":""},"sun":{"comps":"","orders":"","followUps":""}}
\.


--
-- Name: brands brands_manufacturer_id_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_manufacturer_id_name_unique UNIQUE (manufacturer_id, name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: frame_holds frame_holds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frame_holds
    ADD CONSTRAINT frame_holds_pkey PRIMARY KEY (id);


--
-- Name: frames frames_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frames
    ADD CONSTRAINT frames_pkey PRIMARY KEY (id);


--
-- Name: lab_orders lab_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_pkey PRIMARY KEY (id);


--
-- Name: labs labs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_pkey PRIMARY KEY (id);


--
-- Name: manufacturers manufacturers_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manufacturers
    ADD CONSTRAINT manufacturers_name_unique UNIQUE (name);


--
-- Name: manufacturers manufacturers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manufacturers
    ADD CONSTRAINT manufacturers_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: weekly_metrics weekly_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_metrics
    ADD CONSTRAINT weekly_metrics_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: brands brands_manufacturer_id_manufacturers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_manufacturer_id_manufacturers_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id) ON DELETE CASCADE;


--
-- Name: frame_holds frame_holds_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frame_holds
    ADD CONSTRAINT frame_holds_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: frame_holds frame_holds_frame_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frame_holds
    ADD CONSTRAINT frame_holds_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.frames(id) ON DELETE SET NULL;


--
-- Name: frames frames_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frames
    ADD CONSTRAINT frames_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: lab_orders lab_orders_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: lab_orders lab_orders_frame_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.frames(id) ON DELETE SET NULL;


--
-- Name: labs labs_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: users users_clinic_id_clinics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clinic_id_clinics_id_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;


--
-- Name: weekly_metrics weekly_metrics_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_metrics
    ADD CONSTRAINT weekly_metrics_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PjCfsoJiZNHfsoEb9yP79e2dwoIzfgz27GNhvZUK2oeOuyWPSL4oLq7JPtlIWod


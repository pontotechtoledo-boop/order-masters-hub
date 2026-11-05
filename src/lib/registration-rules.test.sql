-- Run read-only via the database query tool; false means a regression.
SELECT public.valid_registration_document('529.982.247-25') AS valid_cpf,
       NOT public.valid_registration_document('529.982.247-26') AS invalid_cpf,
       public.valid_registration_document('58.007.400/0001-09') AS valid_cnpj,
       NOT public.valid_registration_document('58.007.400/0001-08') AS invalid_cnpj,
       NOT public.valid_registration_document('111.111.111-11') AS repeated_digits,
       NOT public.valid_registration_document('') AS document_required,
       pg_get_functiondef('public.ensure_user_organization()'::regprocedure) NOT LIKE '%pontotechtoledo@gmail.com%' AS no_preset_company,
       EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='validate_registration_document' AND tgenabled='O') AS signup_validation_enabled,
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='auth' AND tablename='users' AND indexname='users_email_partial_key' AND indexdef LIKE 'CREATE UNIQUE INDEX%') AS unique_email;
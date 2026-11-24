
package com.carmarketplace.repository;

import com.carmarketplace.entity.CarCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarCatalogRepository extends JpaRepository<CarCatalog, Long> {

    @Query("SELECT DISTINCT c.make FROM CarCatalog c ORDER BY c.make")
    List<String> findAllMakes();

    @Query(value = """
            WITH catalog AS (
                SELECT
                    LOWER(REPLACE(REPLACE(c.make, ' ', ''), '-', '')) AS normalized_make,

                    CASE
                        -- E-Class: model name is stored in variant
                        WHEN c.model ~* '^E Class$'
                             AND c.variant ~* '^E[0-9]{2,3}( AMG)?([[:space:]]|$)'
                            THEN REGEXP_REPLACE(
                                c.variant,
                                '^(E[0-9]{2,3}( AMG)?).*$',
                                '\\1',
                                'i'
                            )

                        -- C-Class: model name is stored in variant
                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C36 AMG'
                            THEN 'C36 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C43'
                            THEN 'C43 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C55 AMG'
                            THEN 'C55 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C63'
                            THEN 'C63 AMG'

                        -- E500
                        WHEN c.model ~* '^E ?500( \\(W[0-9]{3}\\))?$'
                            THEN 'E500'

                        -- E50 AMG
                        WHEN c.model ~* '^E ?50 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'E50 AMG'

                        -- E53 Hybrid
                        WHEN c.model ~* '^Mercedes-AMG E53 Hybrid Estate$'
                            THEN 'E53 Hybrid Estate'

                        WHEN c.model ~* '^Mercedes-AMG E53 Hybrid$'
                            THEN 'E53 Hybrid'

                        -- E53
                        WHEN c.model ~* '^Mercedes-AMG E53$'
                            THEN 'E53 AMG'

                        WHEN c.model ~* '^E53 Coupe( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E53 AMG'

                        WHEN c.model ~* '^E53 AMG( T-Modell| Cabriolet)?( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E53 AMG'

                        -- E43
                        WHEN c.model ~* '^E43 AMG( T-Modell)?( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E43 AMG'

                        -- E63
                        WHEN c.model ~* '^(Mercedes-Benz )?E ?63 AMG( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E63 AMG'

                        -- C36 AMG
                        WHEN c.model ~* '^C ?36 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'C36 AMG'

                        -- C43 Estate
                        WHEN c.model ~* '^C43 AMG Estate$'
                             OR c.model ~* '^C ?43 T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C43 AMG Estate'

                        -- C43 Sedan
                        WHEN c.model ~* '^C ?43( AMG)?( 4MATIC)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C43 AMG'

                        -- C450 AMG Estate
                        WHEN c.model ~* '^Mercedes-Benz C ?450 AMG 4Matic T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C450 AMG Estate'

                        -- C450 AMG Sedan
                        WHEN c.model ~* '^C ?450 AMG( 4Matic)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C450 AMG'

                        -- C55 AMG Estate
                        WHEN c.model ~* '^Mercedes-Benz C ?55 AMG T-Modell$'
                            THEN 'C55 AMG Estate'

                        -- C55 AMG Sedan
                        WHEN c.model ~* '^Mercedes-Benz C ?55 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'C55 AMG'

                        -- C63 S E Performance
                        WHEN c.model ~* '^C ?63 S E PERFORMANCE$'
                            THEN 'C63 S E Performance'

                        -- C63 Black Series
                        WHEN c.model ~* '^Mercedes-Benz C ?63 Coupé AMG Black Series$'
                            THEN 'C63 AMG Black Series'

                        -- C63 Estate
                        WHEN c.model ~* '^C ?63 AMG T-Modell \\(S[0-9]{3}\\)$'
                             OR c.model ~* '^C ?63 T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C63 AMG Estate'

                        -- C63 Cabriolet
                        WHEN c.model ~* '^C ?63 Cabriolet \\(A[0-9]{3}\\)$'
                            THEN 'C63 AMG Cabriolet'

                        -- C63 Coupe
                        WHEN c.model ~* '^C ?63 Coupe \\(C[0-9]{3}\\)$'
                            THEN 'C63 AMG Coupe'

                        -- C63 Sedan
                        WHEN c.model ~* '^C ?63( AMG)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C63 AMG'

                        -- G55
                        WHEN c.model ~* '^(Mercedes-Benz )?G ?55 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'G55 AMG'

                        -- S63 Cabriolet
                        WHEN c.model ~* '^Mercedes-AMG S ?63 Cabriolet$'
                             OR c.model ~* '^S ?63 Cabriolet( \\(A[0-9]{3}\\))?$'
                            THEN 'S63 AMG Cabriolet'

                        -- S63 Coupe
                        WHEN c.model ~* '^(Mercedes-Benz )?S ?63 AMG Coupe( \\(C[0-9]{3}\\))?$'
                            THEN 'S63 AMG Coupe'

                        -- S63 Long
                        WHEN c.model ~* '^Mercedes-AMG S ?63 L$'
                            THEN 'S63 AMG L'

                        -- S63 Sedan
                        WHEN c.model ~* '^Mercedes-AMG S ?63$'
                             OR c.model ~* '^S ?63 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'S63 AMG'

                        -- Other models
                        ELSE REGEXP_REPLACE(
                            c.model,
                            '\\s*\\([A-Z][0-9]{3}\\)$',
                            '',
                            'i'
                        )
                    END AS normalized_model,

                    COALESCE(
                        NULLIF(TRIM(c.generation), ''),

                        CASE
                            WHEN c.model ~* '^E Class$'
                                THEN SUBSTRING(
                                    c.variant FROM '([A-Z][0-9]{3})$'
                                )

                            WHEN c.model ~* '^C Class$'
                                THEN SUBSTRING(
                                    c.variant FROM '([A-Z][0-9]{3})$'
                                )

                            -- C43 Sedan: generation from engine
                            WHEN c.model ~* '^C ?43( 4MATIC)?$'
                                 AND c.variant ILIKE '%2.0L%'
                                THEN 'W206'

                            WHEN c.model ~* '^C ?43( 4MATIC)?$'
                                 AND c.variant ILIKE '%3.0%'
                                THEN 'W205'

                            -- C43 Estate: generation from engine
                            WHEN c.model ~* '^C43 AMG Estate$'
                                 AND c.variant ILIKE '%2.0L%'
                                THEN 'S206'

                            WHEN c.model ~* '^C43 AMG Estate$'
                                 AND c.variant ILIKE '%3.0%'
                                THEN 'S205'

                            ELSE NULL
                        END,

                        SUBSTRING(
                            c.model FROM '\\(([A-Z][0-9]{3})\\)$'
                        )
                    ) AS generation

                FROM car_catalog c
            )

            SELECT DISTINCT normalized_model
            FROM catalog
            WHERE normalized_make =
                  LOWER(REPLACE(REPLACE(:make, ' ', ''), '-', ''))
              AND normalized_model IS NOT NULL
              AND TRIM(normalized_model) <> ''
            ORDER BY normalized_model
            """, nativeQuery = true)
    List<String> findModelsByMake(@Param("make") String make);


    @Query(value = """
            WITH catalog AS (
                SELECT
                    LOWER(REPLACE(REPLACE(c.make, ' ', ''), '-', '')) AS normalized_make,

                    CASE
                        -- E-Class: model name is stored in variant
                        WHEN c.model ~* '^E Class$'
                             AND c.variant ~* '^E[0-9]{2,3}( AMG)?([[:space:]]|$)'
                            THEN REGEXP_REPLACE(
                                c.variant,
                                '^(E[0-9]{2,3}( AMG)?).*$',
                                '\\1',
                                'i'
                            )

                        -- C-Class: model name is stored in variant
                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C36 AMG'
                            THEN 'C36 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C43'
                            THEN 'C43 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C55 AMG'
                            THEN 'C55 AMG'

                        WHEN c.model ~* '^C Class$'
                             AND c.variant ~* '^C63'
                            THEN 'C63 AMG'

                        -- E500
                        WHEN c.model ~* '^E ?500( \\(W[0-9]{3}\\))?$'
                            THEN 'E500'

                        -- E50 AMG
                        WHEN c.model ~* '^E ?50 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'E50 AMG'

                        -- E53 Hybrid
                        WHEN c.model ~* '^Mercedes-AMG E53 Hybrid Estate$'
                            THEN 'E53 Hybrid Estate'

                        WHEN c.model ~* '^Mercedes-AMG E53 Hybrid$'
                            THEN 'E53 Hybrid'

                        -- E53
                        WHEN c.model ~* '^Mercedes-AMG E53$'
                            THEN 'E53 AMG'

                        WHEN c.model ~* '^E53 Coupe( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E53 AMG'

                        WHEN c.model ~* '^E53 AMG( T-Modell| Cabriolet)?( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E53 AMG'

                        -- E43
                        WHEN c.model ~* '^E43 AMG( T-Modell)?( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E43 AMG'

                        -- E63
                        WHEN c.model ~* '^(Mercedes-Benz )?E ?63 AMG( \\([A-Z][0-9]{3}\\))?$'
                            THEN 'E63 AMG'

                        -- C36 AMG
                        WHEN c.model ~* '^C ?36 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'C36 AMG'

                        -- C43 Estate
                        WHEN c.model ~* '^C43 AMG Estate$'
                             OR c.model ~* '^C ?43 T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C43 AMG Estate'

                        -- C43 Sedan
                        WHEN c.model ~* '^C ?43( AMG)?( 4MATIC)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C43 AMG'

                        -- C450 AMG Estate
                        WHEN c.model ~* '^Mercedes-Benz C ?450 AMG 4Matic T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C450 AMG Estate'

                        -- C450 AMG Sedan
                        WHEN c.model ~* '^C ?450 AMG( 4Matic)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C450 AMG'

                        -- C55 AMG Estate
                        WHEN c.model ~* '^Mercedes-Benz C ?55 AMG T-Modell$'
                            THEN 'C55 AMG Estate'

                        -- C55 AMG Sedan
                        WHEN c.model ~* '^Mercedes-Benz C ?55 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'C55 AMG'

                        -- C63 S E Performance
                        WHEN c.model ~* '^C ?63 S E PERFORMANCE$'
                            THEN 'C63 S E Performance'

                        -- C63 Black Series
                        WHEN c.model ~* '^Mercedes-Benz C ?63 Coupé AMG Black Series$'
                            THEN 'C63 AMG Black Series'

                        -- C63 Estate
                        WHEN c.model ~* '^C ?63 AMG T-Modell \\(S[0-9]{3}\\)$'
                             OR c.model ~* '^C ?63 T-Modell \\(S[0-9]{3}\\)$'
                            THEN 'C63 AMG Estate'

                        -- C63 Cabriolet
                        WHEN c.model ~* '^C ?63 Cabriolet \\(A[0-9]{3}\\)$'
                            THEN 'C63 AMG Cabriolet'

                        -- C63 Coupe
                        WHEN c.model ~* '^C ?63 Coupe \\(C[0-9]{3}\\)$'
                            THEN 'C63 AMG Coupe'

                        -- C63 Sedan
                        WHEN c.model ~* '^C ?63( AMG)?( \\(W[0-9]{3}\\))?$'
                            THEN 'C63 AMG'

                        -- G55
                        WHEN c.model ~* '^(Mercedes-Benz )?G ?55 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'G55 AMG'

                        -- S63 Cabriolet
                        WHEN c.model ~* '^Mercedes-AMG S ?63 Cabriolet$'
                             OR c.model ~* '^S ?63 Cabriolet( \\(A[0-9]{3}\\))?$'
                            THEN 'S63 AMG Cabriolet'

                        -- S63 Coupe
                        WHEN c.model ~* '^(Mercedes-Benz )?S ?63 AMG Coupe( \\(C[0-9]{3}\\))?$'
                            THEN 'S63 AMG Coupe'

                        -- S63 Long
                        WHEN c.model ~* '^Mercedes-AMG S ?63 L$'
                            THEN 'S63 AMG L'

                        -- S63 Sedan
                        WHEN c.model ~* '^Mercedes-AMG S ?63$'
                             OR c.model ~* '^S ?63 AMG( \\(W[0-9]{3}\\))?$'
                            THEN 'S63 AMG'

                        ELSE REGEXP_REPLACE(
                            c.model,
                            '\\s*\\([A-Z][0-9]{3}\\)$',
                            '',
                            'i'
                        )
                    END AS normalized_model,

                    COALESCE(
                        NULLIF(TRIM(c.generation), ''),

                        CASE
                            WHEN c.model ~* '^E Class$'
                                THEN SUBSTRING(
                                    c.variant FROM '([A-Z][0-9]{3})$'
                                )

                            WHEN c.model ~* '^C Class$'
                                THEN SUBSTRING(
                                    c.variant FROM '([A-Z][0-9]{3})$'
                                )

                            -- C43 Sedan: generation from engine
                            WHEN c.model ~* '^C ?43( 4MATIC)?$'
                                 AND c.variant ILIKE '%2.0L%'
                                THEN 'W206'

                            WHEN c.model ~* '^C ?43( 4MATIC)?$'
                                 AND c.variant ILIKE '%3.0%'
                                THEN 'W205'

                            -- C43 Estate: generation from engine
                            WHEN c.model ~* '^C43 AMG Estate$'
                                 AND c.variant ILIKE '%2.0L%'
                                THEN 'S206'

                            WHEN c.model ~* '^C43 AMG Estate$'
                                 AND c.variant ILIKE '%3.0%'
                                THEN 'S205'

                            ELSE NULL
                        END,

                        SUBSTRING(
                            c.model FROM '\\(([A-Z][0-9]{3})\\)$'
                        )
                    ) AS generation

                FROM car_catalog c
            )

            SELECT DISTINCT generation
            FROM catalog
            WHERE normalized_make =
                  LOWER(REPLACE(REPLACE(:make, ' ', ''), '-', ''))
              AND LOWER(normalized_model) = LOWER(:model)
              AND generation IS NOT NULL
            ORDER BY generation
            """, nativeQuery = true)
    List<String> findGenerationsByMakeAndModel(
            @Param("make") String make,
            @Param("model") String model
    );
}

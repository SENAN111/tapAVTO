
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

    @Query("SELECT DISTINCT c.model FROM CarCatalog c " +
            "WHERE LOWER(c.make) = LOWER(:make) ORDER BY c.model")
    List<String> findModelsByMake(@Param("make") String make);
}

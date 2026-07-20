package com.patris.repository;

import com.patris.model.Immobilier;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ImmobilierRepository extends JpaRepository<Immobilier, Long> {

    @Query("""
        SELECT DISTINCT
            n.comptePrincipal,
            n.libelleCompte,
            n.partie,
            n.typeBien
        FROM NomenclatureCompte n
        WHERE n.actif = true
        AND n.section = 'IMMOBILISATION'
        ORDER BY n.comptePrincipal
        """)
    List<Object[]> findComptesImmobilisation();

}

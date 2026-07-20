package com.patris.repository;

import com.patris.model.NomenclatureCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NomenclatureCompteRepository extends JpaRepository<NomenclatureCompte, String> {

    /**
     * Comptes principaux.
     */
    @Query("""
        SELECT DISTINCT
               n.comptePrincipal,
               n.libelleCompte,
               n.partie,
               n.typeBien
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (:partie IS NULL OR n.partie = :partie)
          AND (:typeBien IS NULL OR n.typeBien = :typeBien)
        ORDER BY n.comptePrincipal
    """)
    List<Object[]> findDistinctComptes(
            @Param("partie") String partie,
            @Param("typeBien") String typeBien
    );

    /**
     * Catégories.
     */
    @Query("""
        SELECT DISTINCT n.categorie
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (:compte IS NULL OR n.comptePrincipal = :compte)
          AND (:partie IS NULL OR n.partie = :partie)
          AND (:typeBien IS NULL OR n.typeBien = :typeBien)
        ORDER BY n.categorie
    """)
    List<String> findDistinctCategories(
            @Param("compte") String compte,
            @Param("partie") String partie,
            @Param("typeBien") String typeBien
    );

    /**
     * Familles.
     */
    @Query("""
        SELECT DISTINCT n.famille
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (:categorie IS NULL OR n.categorie = :categorie)
          AND (:compte IS NULL OR n.comptePrincipal = :compte)
          AND (:partie IS NULL OR n.partie = :partie)
          AND (:typeBien IS NULL OR n.typeBien = :typeBien)
        ORDER BY n.famille
    """)
    List<String> findDistinctFamilles(
            @Param("categorie") String categorie,
            @Param("compte") String compte,
            @Param("partie") String partie,
            @Param("typeBien") String typeBien
    );

    /**
     * Articles.
     */
    @Query("""
        SELECT n
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (:famille IS NULL OR n.famille = :famille)
          AND (:compte IS NULL OR n.comptePrincipal = :compte)
          AND (:categorie IS NULL OR n.categorie = :categorie)
          AND (:partie IS NULL OR n.partie = :partie)
          AND (:typeBien IS NULL OR n.typeBien = :typeBien)
        ORDER BY n.comptePrincipal, n.code
    """)
    List<NomenclatureCompte> findArticles(
            @Param("famille") String famille,
            @Param("compte") String compte,
            @Param("categorie") String categorie,
            @Param("partie") String partie,
            @Param("typeBien") String typeBien
    );

    /**
     * Recherche.
     */
    @Query("""
        SELECT n
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (
                :q IS NULL
                OR LOWER(n.code) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(n.intitule) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(n.libelleCompte) LIKE LOWER(CONCAT('%', :q, '%'))
          )
          AND (:partie IS NULL OR n.partie = :partie)
          AND (:typeBien IS NULL OR n.typeBien = :typeBien)
        ORDER BY n.code
    """)
    List<NomenclatureCompte> search(
            @Param("q") String q,
            @Param("partie") String partie,
            @Param("typeBien") String typeBien
    );

    /**
     * Nombre d'articles d'un compte.
     */
    long countByComptePrincipalAndActifTrue(String comptePrincipal);

    /**
     * Comptes des consommables.
     */
    @Query("""
        SELECT DISTINCT
               n.comptePrincipal,
               n.libelleCompte,
               n.partie,
               n.typeBien
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND n.comptePrincipal IN (
                '601',
                '602',
                '603',
                '604',
                '606',
                '607',
                '608'
          )
        ORDER BY n.comptePrincipal
    """)
    List<Object[]> findComptesConsommables();

    /**
     * Comptes des immobilisations.
     */
    @Query("""
        SELECT DISTINCT
               n.comptePrincipal,
               n.libelleCompte,
               n.partie,
               n.typeBien
        FROM NomenclatureCompte n
        WHERE n.actif = true
          AND (
                n.comptePrincipal LIKE '21%'
             OR n.comptePrincipal LIKE '22%'
             OR n.comptePrincipal LIKE '23%'
             OR n.comptePrincipal LIKE '24%'
          )
        ORDER BY n.comptePrincipal
    """)
    List<Object[]> findComptesImmobilisation();

}
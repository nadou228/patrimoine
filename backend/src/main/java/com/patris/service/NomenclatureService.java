package com.patris.service;

import com.patris.model.NomenclatureCompte;
import com.patris.repository.NomenclatureCompteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NomenclatureService {

    @Autowired
    private NomenclatureCompteRepository repository;

    /**
     * Retourne la liste des comptes principaux.
     */
    public List<Map<String, Object>> getComptes(String partie, String typeBien) {

        List<Object[]> results = repository.findDistinctComptes(partie, typeBien);

        return results.stream().map(row -> {

            Map<String, Object> map = new HashMap<>();

            map.put("compte_principal", row[0]);
            map.put("libelle_compte", row[1]);
            map.put("partie", row[2]);
            map.put("type_bien", row[3]);
            map.put("nb_items",
                    repository.countByComptePrincipalAndActifTrue((String) row[0]));

            return map;

        }).collect(Collectors.toList());
    }

    /**
     * Retourne les catégories d'un compte.
     */
    public List<Map<String, Object>> getCategories(String compte,
                                                   String partie,
                                                   String typeBien) {

        List<String> categories =
                repository.findDistinctCategories(compte, partie, typeBien);

        return categories.stream().map(cat -> {

            Map<String, Object> map = new HashMap<>();

            map.put("categorie", cat);
            map.put("compte_principal", compte);

            return map;

        }).collect(Collectors.toList());
    }

    /**
     * Retourne les familles d'une catégorie.
     */
    public List<Map<String, Object>> getFamilles(String categorie,
                                                 String compte,
                                                 String partie,
                                                 String typeBien) {

        List<String> familles =
                repository.findDistinctFamilles(categorie, compte, partie, typeBien);

        return familles.stream().map(fam -> {

            Map<String, Object> map = new HashMap<>();

            map.put("famille", fam);
            map.put("categorie", categorie);

            return map;

        }).collect(Collectors.toList());
    }

    /**
     * Retourne les articles.
     */
    public List<NomenclatureCompte> getArticles(String famille,
                                                String compte,
                                                String categorie,
                                                String partie,
                                                String typeBien) {

        return repository.findArticles(
                famille,
                compte,
                categorie,
                partie,
                typeBien
        );
    }

    /**
     * Recherche plein texte.
     */
    public List<NomenclatureCompte> search(String q,
                                           String partie,
                                           String typeBien) {

        return repository.search(q, partie, typeBien);
    }

    /**
     * Recherche par code.
     */
    public NomenclatureCompte getByCode(String code) {

        return repository.findById(code).orElse(null);
    }

    /**
     * Import.
     */
    public void importData(List<NomenclatureCompte> data) {

        repository.saveAll(data);
    }

    /**
     * Création / Modification.
     */
    public NomenclatureCompte save(NomenclatureCompte item) {

        return repository.save(item);
    }

    /**
     * Suppression logique.
     */
    public void delete(String code) {

        repository.findById(code).ifPresent(item -> {
            item.setActif(false);
            repository.save(item);
        });
    }

    /**
     * Comptes des consommables.
     */
    public List<Map<String, Object>> getComptesConsommables() {

        List<Object[]> results = repository.findComptesConsommables();

        return results.stream().map(row -> {

            Map<String, Object> map = new HashMap<>();

            map.put("compte_principal", row[0]);
            map.put("libelle_compte", row[1]);
            map.put("partie", row[2]);
            map.put("type_bien", row[3]);

            return map;

        }).collect(Collectors.toList());
    }

    /**
     * Comptes des immobilisations.
     */
    public List<Map<String, Object>> getComptesImmobilisation() {

        List<Object[]> results = repository.findComptesImmobilisation();

        return results.stream().map(row -> {

            Map<String, Object> map = new HashMap<>();

            map.put("compte_principal", row[0]);
            map.put("libelle_compte", row[1]);
            map.put("partie", row[2]);
            map.put("type_bien", row[3]);

            return map;

        }).collect(Collectors.toList());
    }
}
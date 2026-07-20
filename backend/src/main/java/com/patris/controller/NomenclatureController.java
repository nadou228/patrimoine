package com.patris.controller;

import com.patris.model.NomenclatureCompte;
import com.patris.service.NomenclatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nomenclature")
@CrossOrigin(origins = "*")
public class NomenclatureController {

    @Autowired
    private NomenclatureService service;

    /**
     * Liste des comptes principaux.
     */
    @GetMapping("/comptes")
    public ResponseEntity<?> getComptes(
            @RequestParam(required = false) String partie,
            @RequestParam(required = false, name = "type_bien") String typeBien) {

        List<Map<String, Object>> data = service.getComptes(partie, typeBien);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("meta", Map.of("total", data.size()));

        return ResponseEntity.ok(response);
    }

    /**
     * Liste des catégories.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(
            @RequestParam(required = false) String compte,
            @RequestParam(required = false) String partie,
            @RequestParam(required = false, name = "type_bien") String typeBien) {

        List<Map<String, Object>> data =
                service.getCategories(compte, partie, typeBien);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("meta", Map.of("total", data.size()));

        return ResponseEntity.ok(response);
    }

    /**
     * Liste des familles.
     */
    @GetMapping("/familles")
    public ResponseEntity<?> getFamilles(
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String compte,
            @RequestParam(required = false) String partie,
            @RequestParam(required = false, name = "type_bien") String typeBien) {

        List<Map<String, Object>> data =
                service.getFamilles(categorie, compte, partie, typeBien);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("meta", Map.of("total", data.size()));

        return ResponseEntity.ok(response);
    }

    /**
     * Liste des articles.
     */
    @GetMapping("/articles")
    public ResponseEntity<?> getArticles(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String compte,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String partie,
            @RequestParam(required = false, name = "type_bien") String typeBien) {

        List<NomenclatureCompte> data =
                service.getArticles(famille, compte, categorie, partie, typeBien);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("meta", Map.of("total", data.size()));

        return ResponseEntity.ok(response);
    }

    /**
     * Recherche d'articles.
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam String q,
            @RequestParam(required = false) String partie,
            @RequestParam(required = false, name = "type_bien") String typeBien,
            @RequestParam(defaultValue = "20") int limit) {

        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", Map.of(
                            "code", "QUERY_TOO_SHORT",
                            "message", "Le terme de recherche doit contenir au moins 2 caractères"
                    )
            ));
        }

        List<NomenclatureCompte> data =
                service.search(q, partie, typeBien);

        if (data.size() > limit) {
            data = data.subList(0, limit);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("meta", Map.of(
                "total", data.size(),
                "terme", q
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Recherche par code.
     */
    @GetMapping("/{code}")
    public ResponseEntity<?> getByCode(@PathVariable String code) {

        NomenclatureCompte data = service.getByCode(code);

        if (data == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", Map.of(
                            "code", "NOT_FOUND",
                            "message", "Code nomenclature '" + code + "' introuvable"
                    )
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data
        ));
    }

    /**
     * Import de la nomenclature.
     */
    @PostMapping("/import")
    public ResponseEntity<?> importData(
            @RequestBody Map<String, List<NomenclatureCompte>> payload) {

        List<NomenclatureCompte> data = payload.get("data");

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Aucune donnée reçue."
            ));
        }

        service.importData(data);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "traites", data.size(),
                        "message", "Import terminé avec succès."
                )
        ));
    }

    /**
     * Création.
     */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody NomenclatureCompte item) {

        if (service.getByCode(item.getCode()) != null) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "error", Map.of(
                            "code", "CODE_ALREADY_EXISTS",
                            "message", "Le code " + item.getCode() + " existe déjà."
                    )
            ));
        }

        NomenclatureCompte created = service.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", created
        ));
    }

    /**
     * Modification.
     */
    @PutMapping("/{code}")
    public ResponseEntity<?> update(
            @PathVariable String code,
            @RequestBody NomenclatureCompte item) {

        if (service.getByCode(code) == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", Map.of(
                            "code", "NOT_FOUND",
                            "message", "Code nomenclature introuvable."
                    )
            ));
        }

        item.setCode(code);

        NomenclatureCompte updated = service.save(item);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated
        ));
    }

    /**
     * Suppression logique.
     */
    @DeleteMapping("/{code}")
    public ResponseEntity<?> delete(
            @PathVariable String code) {

        service.delete(code);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "message", "Code " + code + " archivé avec succès."
                )
        ));
    }

    /**
     * Comptes des consommables.
     */
    @GetMapping("/comptes/consommables")
    public ResponseEntity<?> getComptesConsommables() {

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", service.getComptesConsommables()
        ));
    }

    /**
     * Comptes des immobilisations.
     */
    @GetMapping("/comptes/immobilisations")
    public ResponseEntity<?> getComptesImmobilisation() {

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", service.getComptesImmobilisation()
        ));
    }
}
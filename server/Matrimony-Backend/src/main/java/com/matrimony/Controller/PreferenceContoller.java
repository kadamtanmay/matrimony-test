package com.matrimony.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matrimony.Entity.Preferences;
import com.matrimony.Service.PreferenceService;

@RestController
@RequestMapping("/user/preferences")
@CrossOrigin(origins = "http://localhost:3000")
public class PreferenceContoller {

    @Autowired
    private PreferenceService preferenceService;
    
    @PostMapping("/save/{id}")
    public ResponseEntity<Preferences> savePreferences(@RequestBody Preferences preferences, @PathVariable Long id) {
        Preferences savedPreferences = preferenceService.savePreferences(preferences, id);
        return ResponseEntity.ok(savedPreferences);
    }
}


package com.carmarketplace.controller;

import com.carmarketplace.dto.CarEditRequestRejectRequest;
import com.carmarketplace.dto.CarEditRequestResponse;
import com.carmarketplace.service.AdminCarEditService;
import com.carmarketplace.service.CarEditRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/car-edits")
@RequiredArgsConstructor
public class AdminCarEditController {

    private final AdminCarEditService adminCarEditService;
    private final CarEditRequestService carEditRequestService;

    // Gözləyən redaktə sorğuları
    @GetMapping("/pending")
    public ResponseEntity<List<CarEditRequestResponse>> getPendingRequests() {

        return ResponseEntity.ok(
                carEditRequestService.getPendingRequests()
        );
    }

    // Redaktə sorğusunu təsdiqlə
    @PatchMapping("/{requestId}/approve")
    public ResponseEntity<String> approveEditRequest(
            @PathVariable Long requestId) {

        adminCarEditService.approveEditRequest(requestId);

        return ResponseEntity.ok(
                "Elanın redaktəsi uğurla təsdiqləndi"
        );
    }

    // Redaktə sorğusunu rədd et
    @PatchMapping("/{requestId}/reject")
    public ResponseEntity<String> rejectEditRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody CarEditRequestRejectRequest request) {

        adminCarEditService.rejectEditRequest(
                requestId,
                request.getReason()
        );

        return ResponseEntity.ok(
                "Elanın redaktəsi rədd edildi"
        );
    }
}

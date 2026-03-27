package com.example.AirBnb_Project.Controller;

import com.example.AirBnb_Project.Service.InventoryService;
import com.example.AirBnb_Project.dto.InventoryDto;
import com.example.AirBnb_Project.dto.UpdateInventoryReqDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<List<InventoryDto>> getAllInventories (@PathVariable Long roomId ) throws AccessDeniedException {
        return ResponseEntity.ok(inventoryService.getallInventoryByRoom(roomId));
    }
    @PatchMapping("/rooms/{roomId}")
    public ResponseEntity<Void> updateInventory (@PathVariable Long roomId , @RequestBody UpdateInventoryReqDto invreqDto) throws AccessDeniedException {
        inventoryService.updateInventory(roomId, invreqDto);
        return ResponseEntity.noContent().build();

    }


}

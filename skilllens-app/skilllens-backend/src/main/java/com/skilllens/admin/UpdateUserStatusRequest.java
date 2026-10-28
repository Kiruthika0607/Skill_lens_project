package com.skilllens.admin;

import com.skilllens.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {
    private Boolean isActive;
    private Boolean enabled;
    private Role role;
}

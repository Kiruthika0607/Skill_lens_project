package com.skilllens.user;

/**
 * Application roles — only STUDENT is self-assignable through public registration.
 * ADMIN must be provisioned through a controlled initialization process.
 */
public enum Role {
    STUDENT,
    ADMIN
}

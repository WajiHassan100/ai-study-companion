"""Tests for the auth primitives: bcrypt hashing and JWT signing/verification."""

from app.core.security import (
    create_access_token,
    decode_access_token,
    decode_supabase_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip():
    hashed = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong password", hashed)


def test_password_hash_is_salted():
    assert hash_password("same password") != hash_password("same password")


def test_token_roundtrip():
    token = create_access_token("user-123", "student")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["role"] == "student"


def test_garbage_token_rejected():
    assert decode_access_token("not-a-real-token") is None
    assert decode_access_token("a.b.c") is None


def test_supabase_token_decodes_with_secret(supabase_token):
    payload = decode_supabase_token(supabase_token)
    assert payload is not None
    assert payload["sub"] == "11111111-2222-4333-8444-555555555555"


def test_supabase_token_not_decoded_by_app_secret(supabase_token):
    # A Supabase token must not be accepted as an app-issued token.
    assert decode_access_token(supabase_token) is None


def test_app_token_not_decoded_by_supabase_secret():
    token = create_access_token("user-123", "student")
    assert decode_supabase_token(token) is None

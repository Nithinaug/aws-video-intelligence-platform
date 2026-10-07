package storage

import "testing"

func TestLocalStorageRejectsTraversal(t *testing.T) {
	l := NewLocalStorage(t.TempDir(), "http://localhost")

	for _, key := range []string{"../escape.txt", "uploads/../../escape.txt", ".."} {
		if err := l.PutObject(key, "video/mp4", []byte("x")); err == nil {
			t.Errorf("PutObject(%q) succeeded, want error", key)
		}
		if _, err := l.GetObject(key); err == nil {
			t.Errorf("GetObject(%q) succeeded, want error", key)
		}
	}

	if err := l.PutObject("uploads/u1/1-ok.mp4", "video/mp4", []byte("x")); err != nil {
		t.Fatalf("valid key rejected: %v", err)
	}
}

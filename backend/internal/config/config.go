package config

import "os"

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	Provider      string
	AWSRegion     string
	S3Bucket      string
	CloudFrontURL string
	LocalDataDir  string
}

func Load() Config {
	return Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://videointell:videointell@localhost:5432/videointell?sslmode=disable"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret-change-me"),
		Provider:      getEnv("PROVIDER", "local"),
		AWSRegion:     getEnv("AWS_REGION", "us-east-1"),
		S3Bucket:      getEnv("S3_BUCKET", "videointell-videos"),
		CloudFrontURL: getEnv("CLOUDFRONT_URL", ""),
		LocalDataDir:  getEnv("LOCAL_DATA_DIR", "./data"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

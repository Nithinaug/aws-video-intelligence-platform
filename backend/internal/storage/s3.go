package storage

import (
	"bytes"
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Storage struct {
	Client        *s3.Client
	PresignClient *s3.PresignClient
	Bucket        string
	CloudFrontURL string
}

func NewS3Storage(client *s3.Client, bucket, cloudFrontURL string) *S3Storage {
	return &S3Storage{
		Client:        client,
		PresignClient: s3.NewPresignClient(client),
		Bucket:        bucket,
		CloudFrontURL: cloudFrontURL,
	}
}

func (s *S3Storage) PresignUpload(key, contentType string, expires time.Duration) (string, error) {
	req, err := s.PresignClient.PresignPutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(s.Bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *S3Storage) PresignDownload(key string, expires time.Duration) (string, error) {
	req, err := s.PresignClient.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *S3Storage) PublicURL(key string) string {
	if s.CloudFrontURL != "" {
		return s.CloudFrontURL + "/" + key
	}
	return "https://" + s.Bucket + ".s3.amazonaws.com/" + key
}

func (s *S3Storage) PutObject(key, contentType string, body []byte) error {
	_, err := s.Client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(s.Bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(body),
		ContentType: aws.String(contentType),
	})
	return err
}

func (s *S3Storage) GetObject(key string) ([]byte, error) {
	out, err := s.Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer out.Body.Close()
	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(out.Body); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

import pandas as pd
import torch
import os
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments

print("Loading data...")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'fake_reviews_dataset.csv')

# 1. Tải và chuẩn bị dữ liệu
df = pd.read_csv(CSV_PATH)
df.dropna(subset=['text', 'label'], inplace=True)

train_texts, val_texts, train_labels, val_labels = train_test_split(
    df['text'].tolist(), df['label'].tolist(), test_size=0.2, random_state=42
)

# 2. Khởi tạo Tokenizer của BERT
print("Loading BERT tokenizer...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=128)
val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=128)

# 3. Tạo Dataset class cho PyTorch
class ReviewDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = ReviewDataset(train_encodings, train_labels)
val_dataset = ReviewDataset(val_encodings, val_labels)

# 4. Khởi tạo mô hình BERT
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

# 5. Cấu hình tham số huấn luyện (Fine-tuning)
training_args = TrainingArguments(
    output_dir=os.path.join(BASE_DIR, 'bert_model_checkpoints'),
    num_train_epochs=3,              # Chạy 3 vòng lặp qua toàn bộ dữ liệu
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_dir='./logs',
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

# 6. Bắt đầu huấn luyện
print("Starting to train BERT model (Fine-Tuning)...")
trainer.train()

# 7. Lưu mô hình và tokenizer để sử dụng ở Backend
model_path = os.path.join(BASE_DIR, 'bert_fake_review_model')
model.save_pretrained(model_path)
tokenizer.save_pretrained(model_path)
print(f"✅ Model successfully saved at: {model_path}")
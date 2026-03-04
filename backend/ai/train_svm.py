import pandas as pd
import string
import joblib
import os
from nltk.corpus import stopwords
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.svm import SVC
import nltk
nltk.download('stopwords')

def text_process(review):
    nopunc = [char for char in review if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return [word for word in nopunc.split() if word.lower() not in stopwords.words('english')]

print("Loading data...")
# MỚI: Tự động lấy đường dẫn của thư mục 'ai' hiện tại
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'fake_reviews_dataset.csv')

# Load dataset dựa trên đường dẫn tuyệt đối
df = pd.read_csv(CSV_PATH)
if 'Unnamed: 0' in df.columns:
    df.drop('Unnamed: 0', axis=1, inplace=True)
df.dropna(inplace=True)

print("Training AI (SVM) model...")
pipeline = Pipeline([
    ('bow', CountVectorizer(analyzer=text_process)),
    ('tfidf', TfidfTransformer()),
    # MỚI: Bật tính năng tính xác suất (probability)
    ('classifier', SVC(probability=True))
])

# Train on the entire dataset to get the best model
pipeline.fit(df['text'], df['label'])

# Save the model to a .pkl file
MODEL_PATH = os.path.join(BASE_DIR, 'svm_fake_review_model.pkl')
joblib.dump(pipeline, MODEL_PATH)
print(f"Model successfully saved at {MODEL_PATH} !")
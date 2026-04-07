const API_BASE_URL = '/api';

export interface ApiError {
  detail?: string;
  message?: string;
}

class ApiService {
  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'API request failed');
    }
    return response.json();
  }

  // Predictions
  async getPredictions(token: string) {
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async savePrediction(data: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deletePrediction(id: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async clearAllPredictions(token: string) {
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Stats
  async getStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();

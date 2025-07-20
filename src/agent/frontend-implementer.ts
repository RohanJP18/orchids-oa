import fs from 'fs';
import path from 'path';
import { FrontendOperation } from './types';

export class FrontendImplementer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async executeFrontendOperation(description: string, files: string[], operation: string): Promise<void> {
    console.log(`🎨 Executing frontend operation: ${description}`);
    
    if (description.includes('auth') || description.includes('login') || description.includes('register')) {
      await this.createAuthComponents(files);
    } else if (description.includes('playlist')) {
      await this.createPlaylistComponents(files);
    } else if (description.includes('music') || description.includes('song')) {
      await this.createMusicComponents(files);
    } else {
      await this.createGenericComponents(files);
    }
  }

  private async createAuthComponents(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createAuthComponent(file);
    }
  }

  private async createAuthComponent(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/components/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content = '';
    
    if (filePath.includes('login-form')) {
      content = this.generateLoginForm();
    } else if (filePath.includes('register-form')) {
      content = this.generateRegisterForm();
    } else {
      content = this.generateGenericAuthComponent(filePath);
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Auth component created: ${filePath}`);
  }

  private generateLoginForm(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Welcome back to Spotify Clone
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <a href="/register" className="text-sm text-green-400 hover:text-green-300">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
  }

  private generateRegisterForm(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login?message=Registration successful! Please sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join Spotify Clone today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-green-400 hover:text-green-300">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
  }

  private generateGenericAuthComponent(filePath: string): string {
    const componentName = path.basename(filePath, '.tsx');
    
    return `'use client';

import { useState } from 'react';

export default function ${componentName}() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        ${componentName.replace(/([A-Z])/g, ' $1').trim()}
      </h2>
      <p className="text-gray-300">
        This is a placeholder component for ${componentName}.
      </p>
    </div>
  );
}
`;
  }

  private async createPlaylistComponents(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createPlaylistComponent(file);
    }
  }

  private async createPlaylistComponent(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/components/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = this.generateGenericPlaylistComponent(filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Playlist component created: ${filePath}`);
  }

  private generateGenericPlaylistComponent(filePath: string): string {
    const componentName = path.basename(filePath, '.tsx');
    
    return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 mb-4">
        ⚠️ Playlist Component Not Implemented
      </h2>
      <p className="text-red-600">
        This playlist component requires specific database schema and requirements.
        Please provide detailed specifications for proper implementation.
      </p>
    </div>
  );
}
`;
  }

  private async createMusicComponents(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createMusicComponent(file);
    }
  }

  private async createMusicComponent(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/components/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = this.generateGenericMusicComponent(filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Music component created: ${filePath}`);
  }

  private generateGenericMusicComponent(filePath: string): string {
    const componentName = path.basename(filePath, '.tsx');
    
    return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 mb-4">
        ⚠️ Music Component Not Implemented
      </h2>
      <p className="text-red-600">
        This music component requires specific database schema and requirements.
        Please provide detailed specifications for proper implementation.
      </p>
    </div>
  );
}
`;
  }

  private async createGenericComponents(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createGenericComponent(file);
    }
  }

  private async createGenericComponent(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/components/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = this.generateGenericComponentContent(filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Generic component created: ${filePath}`);
  }

  private generateGenericComponentContent(filePath: string): string {
    const componentName = path.basename(filePath, '.tsx');
    
    return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 mb-4">
        ⚠️ Component Not Implemented
      </h2>
      <p className="text-red-600">
        This component requires specific database schema and requirements.
        Please provide detailed specifications for proper implementation.
      </p>
    </div>
  );
}
`;
  }
} 
import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { useToast } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';

function App() {
    const [id, setId] = useState('');
    const [user, setUser] = useState({
        firstName: '',
        email: '',
        password: '',
        favoriteFruit: '',
    });
    const [registerUser, setRegisterUser] = useState({
        firstName: '',
        email: '',
        password: '',
        favoriteFruit: 'Apple', // Default selection
    });
    const [formErrors, setFormErrors] = useState({
        firstName: '',
        email: '',
        password: '',
        favoriteFruit: '',
    });
    
    // Fruit options for the dropdown
    const fruitOptions = ['Apple', 'Banana', 'Apricot', 'Mango'];
    
    const { toast } = useToast();

    async function post(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data),
            });
            const body = await response.json();

            if (!response.ok) {
                if (body.errors) {
                    // Handle validation errors
                    const errors = {};
                    Object.keys(body.errors).forEach(key => {
                        errors[key] = body.errors[key].msg;
                    });
                    setFormErrors(errors);
                    
                    // Show toast for the first error
                    const firstError = Object.values(errors)[0];
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: firstError,
                    });
                } else {
                    throw new Error('Failed to create user');
                }
                throw new Error(JSON.stringify(body.errors));
            }

            return body;
        } catch (error) {
            if (!error.message.includes('{"')) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                });
            }
            throw error;
        }
    }

    async function get(url) {
        try {
            const response = await fetch(url);
            // Check if the response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            
            const body = await response.json();

            if (!response.ok) {
                const errorMessage = body.errors 
                    ? Array.isArray(body.errors) 
                        ? body.errors.join(', ') 
                        : JSON.stringify(body.errors)
                    : 'Failed to fetch data';
                throw new Error(errorMessage);
            }

            return body;
        } catch (error) {
            const errorMessage = error.message || 'Failed to connect to server';
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
            setUser({ firstName: '', email: '', password: '', favoriteFruit: '' }); // Clear user data on error
            throw error;
        }
    }

    async function getUser() {
        try {
            if (!id) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please enter a user ID",
                });
                return;
            }
            
            if (!/^[0-9]$/.test(id)) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "User ID must be a single digit number",
                });
                return;
            }

            const response = await get(`/api/get-user/${id}`);
            setUser(response.user);
        } catch (error) {
            // Error is already handled by toast in get method
            console.error('Failed to fetch user:', error);
        }
    }

    function handleIdChange(event) {
        setId(event.target.value);
    }

    function handleInputChange(event) {
        const name = event.target.name;
        setRegisterUser({
            ...registerUser,
            [name]: event.target.value
        });
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    }

    function validateForm() {
        const errors = {};
        let isValid = true;
        
        if (!registerUser.firstName) {
            errors.firstName = 'You must include a first name';
            isValid = false;
        }
        
        if (!registerUser.email) {
            errors.email = 'Must include email';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(registerUser.email)) {
            errors.email = 'Email is invalid';
            isValid = false;
        }
        
        if (!registerUser.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (registerUser.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }
        
        setFormErrors(errors);
        return isValid;
    }

    async function createUser(event) {
        event.preventDefault();
        
        // Run validation
        const isValid = validateForm();
        
        if (!isValid) {
            // Show toast for the first error
            const firstError = Object.values(formErrors).find(error => error);
            if (firstError) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: firstError,
                });
            }
            return;
        }
        
        try {
            await post('/api/users/', registerUser);
            setRegisterUser({
                firstName: '',
                email: '',
                password: '',
                favoriteFruit: 'Apple', // Reset to default
            });
            setFormErrors({
                firstName: '',
                email: '',
                password: '',
                favoriteFruit: '',
            });
            toast({
                title: "Success",
                description: "User created successfully!",
            });
        } catch (error) {
            // Error is already handled by toast in post method
            console.error('Failed to create user:', error);
        }
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">Welcome to Coding-Test</h1>
            </header>
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">User Information</h2>
                    <p className="app-intro mb-2">
                        Name: {user.firstName}
                    </p>
                    <p className="app-intro mb-2">
                        Email: {user.email}
                    </p>
                    <p className="app-intro mb-4">
                        Favorite Fruit: {user.favoriteFruit}
                    </p>
                    <div className="flex items-end gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="user-id">User ID</Label>
                            <Input 
                                id="user-id"
                                value={id} 
                                onChange={handleIdChange}
                                placeholder="Enter user ID"
                            />
                        </div>
                        <Button onClick={getUser}>
                            Get User
                        </Button>
                    </div>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Create New User</h2>
                    <form onSubmit={createUser} className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                                id="firstName"
                                name="firstName" 
                                value={registerUser.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                                className={formErrors.firstName ? "border-red-500" : ""}
                            />
                            {formErrors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email"
                                name="email" 
                                type="email"
                                value={registerUser.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className={formErrors.email ? "border-red-500" : ""}
                            />
                            {formErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password"
                                name="password" 
                                type="password"
                                value={registerUser.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                className={formErrors.password ? "border-red-500" : ""}
                            />
                            {formErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="favoriteFruit">Favourite Fruit</Label>
                            <select
                                id="favoriteFruit"
                                name="favoriteFruit"
                                value={registerUser.favoriteFruit}
                                onChange={handleInputChange}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                            >
                                {fruitOptions.map(fruit => (
                                    <option key={fruit} value={fruit}>{fruit}</option>
                                ))}
                            </select>
                            {formErrors.favoriteFruit && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.favoriteFruit}</p>
                            )}
                        </div>
                        <Button type="submit">Create User</Button>
                    </form>
                </div>
            </div>
            
            <Toaster />
        </div>
    );
}

export default App;
